import { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, useDraggable } from "@dnd-kit/core";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

function DraggableSignature({ id, x, y }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  
  const style = {
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: 50,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      className="border-2 border-dashed border-indigo-500 bg-indigo-50 text-indigo-700 px-6 py-3 cursor-grab active:cursor-grabbing font-semibold rounded shadow-md select-none"
    >
      ✍️ Sign Here
    </div>
  );
}

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  const [sigPosition, setSigPosition] = useState({ x: 100, y: 100 });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [useNativeViewer, setUseNativeViewer] = useState(false);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("signature_app_token") || "";
  });
  const [userEmail, setUserEmail] = useState(""); 
  
  const fileInputRef = useRef(null);

  const fetchDocuments = async (currentToken) => {
    const targetToken = currentToken || token;
    if (!targetToken) return;

    try {
      const response = await fetch("http://localhost:8000/api/docs/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${targetToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error("Failed to load documents from database.");
      }
    } catch (error) {
      console.error("Network error fetching documents:", error);
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decodedData = jwtDecode(token);
        setUserEmail(decodedData.sub);
        localStorage.setItem("signature_app_token", token);
        fetchDocuments(token);
      } catch (error) {
        console.error("Invalid token passed");
        setUserEmail("");
        localStorage.removeItem("signature_app_token");
      }
    } else {
      setUserEmail("");
      localStorage.removeItem("signature_app_token");
      setDocuments([]);
    }
  }, [token]);

  const handleFileUpload = async (event) => {
    if (!token) {
      alert("Please log in first!");
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/docs/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert("File uploaded successfully!");
        fetchDocuments(token); 
      } else {
        alert("Upload failed. Make sure your backend is running.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragEnd = (event) => {
    const { delta } = event;
    setSigPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  const handleSaveSignature = async () => {
    if (!token || !selectedDoc) return;
    setIsSaving(true);

    try {
      const response = await fetch("http://localhost:8000/api/signatures/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          doc_id: selectedDoc.id,
          x_coordinate: sigPosition.x,
          y_coordinate: sigPosition.y,
          page_number: 1
        })
      });

      if (response.ok) {
        alert("Signature position saved successfully!");
      } else {
        alert("Failed to save signature.");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPdfUrl = (doc) => {
    if (!doc) return "";
    
    let path = doc.file_path || doc.filepath || doc.path || doc.url || doc.filePath || "";
    
    if (!path) {
      const fallbackDetection = Object.values(doc).find(
        (val) => typeof val === "string" && (val.toLowerCase().endsWith(".pdf") || val.toLowerCase().includes("uploads"))
      );
      if (fallbackDetection) path = fallbackDetection;
    }

    if (!path) return "http://localhost:8000/";

    path = path.replace(/\\/g, "/"); 
    if (path.startsWith("http")) return path;
    
    if (!path.toLowerCase().includes("uploads/")) {
      const cleanFilename = path.startsWith("/") ? path.substring(1) : path;
      path = `uploads/${cleanFilename}`;
    }

    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `http://localhost:8000/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      <div className="max-w-6xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-center">
        <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide">🔐 Security Token:</span>
        <input
          type="text"
          placeholder="Token automatically synced..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
        />
      </div>

      {userEmail && (
        <div className="max-w-6xl mx-auto mb-6 text-indigo-700 font-medium">
          👋 Welcome back, {userEmail}!
        </div>
      )}

      <div className="max-w-6xl mx-auto flex gap-6 h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="w-1/3 bg-white border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Documents</h2>
            
            <div>
              <input 
                type="file" 
                accept="application/pdf"
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors shadow-sm disabled:bg-indigo-400"
              >
                {isUploading ? "..." : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {documents.length === 0 ? (
              <div className="text-center mt-10">
                <p className="text-slate-500 font-medium">No documents yet.</p>
                <p className="text-sm text-slate-400 mt-1">Upload a PDF to get started.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {documents.map((doc) => (
                  <li 
                    key={doc.id} 
                    onClick={() => {
                      setPdfError(""); 
                      setNumPages(null);
                      setSelectedDoc(doc);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedDoc?.id === doc.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-indigo-100"}`}
                  >
                    <p className="font-semibold text-slate-700">{doc.filename}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="w-2/3 bg-slate-100 flex flex-col p-6 overflow-y-auto">
          {selectedDoc ? (
            <div className="w-full flex flex-col items-center">
              
              <div className="bg-slate-800 text-slate-200 text-xs p-4 rounded-xl font-mono w-full mb-4 shadow-md border border-slate-700">
                <p className="font-bold text-indigo-400 border-b border-slate-700 pb-1 mb-2 uppercase tracking-wider text-[10px]">🔍 Live Backend Object Inspector:</p>
                {JSON.stringify(selectedDoc, null, 2)}
              </div>

              <div className="w-full flex justify-between items-center mb-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Generated Render Path:</p>
                  <a href={getPdfUrl(selectedDoc)} target="_blank" rel="noreferrer" className="text-indigo-600 underline break-all hover:text-indigo-800">
                    {getPdfUrl(selectedDoc)}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNativeViewer(!useNativeViewer)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
                  >
                    {useNativeViewer ? "Use Canvas Engine" : "Switch Engine"}
                  </button>
                  <button 
                    onClick={handleSaveSignature}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm shrink-0"
                  >
                    {isSaving ? "Saving..." : "Save Position"}
                  </button>
                </div>
              </div>

              <div className="w-full flex justify-center bg-slate-200 rounded-xl p-4 border border-slate-300 shadow-inner min-h-[600px] overflow-auto">
                <DndContext onDragEnd={handleDragEnd}>
                  <div className="relative bg-white p-2 rounded shadow-md inline-block min-h-[500px] min-w-[450px] border border-slate-400">
                    
                    {useNativeViewer ? (
                      <object
                        data={getPdfUrl(selectedDoc)}
                        type="application/pdf"
                        width="500"
                        height="650"
                        className="rounded border border-slate-200"
                      >
                        <embed src={getPdfUrl(selectedDoc)} type="application/pdf" />
                      </object>
                    ) : pdfError ? (
                      <div className="text-center p-8 text-red-600 font-medium max-w-sm mx-auto">
                        <p className="mb-2">⚠️ Render Engine Error:</p>
                        <p className="text-xs text-slate-500 font-mono mb-4">{pdfError}</p>
                        <a href={getPdfUrl(selectedDoc)} target="_blank" rel="noreferrer" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded shadow">
                          View PDF in Tab
                        </a>
                      </div>
                    ) : (
                      <Document 
                        file={getPdfUrl(selectedDoc)}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        onLoadError={(err) => setPdfError(err.message)}
                        loading={<div className="p-12 font-medium text-slate-600 animate-pulse text-center">Loading document canvas...</div>}
                      >
                        <Page 
                          pageNumber={1} 
                          renderTextLayer={false} 
                          renderAnnotationLayer={false} 
                          width={500} 
                        />
                      </Document>
                    )}

                    <DraggableSignature id="sig-1" x={sigPosition.x} y={sigPosition.y} />
                    
                  </div>
                </DndContext>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a document to preview
            </div>
          )}
        </div>

      </div>
    </div>
  );
}