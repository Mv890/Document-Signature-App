import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, useDraggable } from "@dnd-kit/core";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="border-2 border-dashed border-indigo-500 bg-indigo-50 text-indigo-700 px-6 py-3 cursor-grab font-semibold rounded shadow-md">
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
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState("All");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    if (!token) return alert("Please paste your JWT Token!");
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:8000/api/docs/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (response.ok) alert("File uploaded successfully!");
    } catch (error) {
      alert("Error connecting to backend.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSignature = async () => {
    if (!selectedDoc) return;
    setIsSaving(true);
    try {
      await fetch("http://localhost:8000/api/signatures/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          doc_id: selectedDoc.id,
          x_coordinate: sigPosition.x,
          y_coordinate: sigPosition.y,
          page_number: 1
        })
      });
      alert("Signature position saved!");
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDocuments = documents.filter(doc => filter === "All" || doc.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input type="text" placeholder="Paste your JWT Token..." value={token} onChange={(e) => setToken(e.target.value)} className="w-full p-2 border rounded" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex gap-2 mb-6">
          {["All", "Pending", "Signed", "Rejected"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full ${filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="bg-white p-6 rounded-xl shadow border border-slate-200 cursor-pointer hover:border-indigo-500">
              <h3 className="font-bold text-lg mb-2">{doc.filename}</h3>
              <span className={`px-2 py-1 rounded text-xs ${doc.status === 'Signed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {doc.status || 'Pending'}
              </span>
            </div>
          ))}
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileInputRef.current.click()} className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold">
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </div>
  );
}