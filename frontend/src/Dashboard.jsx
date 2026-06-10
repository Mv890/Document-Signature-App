import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, useDraggable } from "@dnd-kit/core";


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
   
    const token = "your_jwt_token_here"; 

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
        alert("Failed to save signature. Check authentication.");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto flex gap-6 h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Sidebar: Document List */}
        <div className="w-1/3 bg-white border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Documents</h2>
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
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedDoc?.id === doc.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-indigo-100"}`}
                  >
                    <p className="font-semibold text-slate-700">{doc.filename}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Panel: PDF Preview & Drag Context */}
        <div className="w-2/3 bg-slate-100 flex flex-col items-center justify-center relative p-8">
          {selectedDoc ? (
            <>
              {/* Toolbar */}
              <div className="w-full flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-600">Drag the placeholder to the correct position.</p>
                <button 
                  onClick={handleSaveSignature}
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Signature Position"}
                </button>
              </div>

              {/* PDF Viewer wrapped in Drag & Drop Context */}
              <DndContext onDragEnd={handleDragEnd}>
                <div className="relative bg-white p-4 rounded-lg shadow-lg border border-slate-200 inline-block">
                  
                  {/* The actual PDF */}
                  <Document file={selectedDoc.url}>
                    <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={550} />
                  </Document>

                  {/* The Draggable Signature Overlay */}
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