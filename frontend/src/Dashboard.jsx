import { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, useDraggable } from "@dnd-kit/core";

// Define the API URL dynamically
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
      className="border-2 border-dashed border-indigo-500 bg-indigo-50 text-indigo-700 px-6 py-3 cursor-grab active:cursor-grabbing font-semibold rounded shadow-md"
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

  const [token, setToken] = useState(() => localStorage.getItem("signature_app_token") || "");
  const [userEmail, setUserEmail] = useState(""); 
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedData = jwtDecode(token);
        setUserEmail(decodedData.sub);
        localStorage.setItem("signature_app_token", token);
      } catch (error) {
        setUserEmail("");
        localStorage.removeItem("signature_app_token");
      }
    }
  }, [token]);

  const handleFileUpload = async (event) => {
    if (!token) return alert("Please paste your Security Token!");

    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/docs/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert("File uploaded successfully!");
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      alert("Error connecting to backend.");
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
    if (!selectedDoc) return;
    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/signatures/`, {
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

      if (response.ok) alert("Signature position saved!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-center">
        <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide">🔐 Security Token:</span>
        <input
          type="text"
          placeholder="Paste your access_token here..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
        />
      </div>

      <div className="max-w-6xl mx-auto flex gap-6 h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="w-1/3 bg-white border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Documents</h2>
            <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {documents.map((doc) => (
              <li key={doc.id} onClick={() => setSelectedDoc(doc)} className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedDoc?.id === doc.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100"}`}>
                <p className="font-semibold text-slate-700">{doc.filename}</p>
              </li>
            ))}
          </div>
        </div>

        <div className="w-2/3 bg-slate-100 flex flex-col items-center justify-center relative p-8">
          {selectedDoc ? (
            <>
              <div className="w-full flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-600">Drag signature placeholder.</p>
                <button onClick={handleSaveSignature} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium">
                  {isSaving ? "Saving..." : "Save Position"}
                </button>
              </div>
              <DndContext onDragEnd={handleDragEnd}>
                <div className="relative bg-white p-4 rounded-lg shadow-lg border border-slate-200 inline-block overflow-hidden">
                  <Document file={selectedDoc.url}>
                    <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={550} />
                  </Document>
                  <DraggableSignature id="sig-1" x={sigPosition.x} y={sigPosition.y} />
                </div>
              </DndContext>
            </>
          ) : (
            <p className="text-slate-400">Select a document to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}