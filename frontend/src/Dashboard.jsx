import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      const token = localStorage.getItem("token"); // Assuming token is saved here later
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8000/api/docs/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error("Error fetching docs", error);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-6 h-screen">
      {/* Sidebar: Document List */}
      <div className="w-1/3 border-r pr-6">
        <h2 className="text-2xl font-bold mb-4">My Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents found. Please upload one.</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li 
                key={doc.id} 
                onClick={() => setSelectedDoc(doc)}
                className="p-3 border rounded cursor-pointer hover:bg-gray-50"
              >
                <p className="font-semibold truncate">{doc.filename}</p>
                <p className="text-xs text-gray-400">{new Date(doc.upload_date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Panel: PDF Preview */}
      <div className="w-2/3 bg-gray-100 flex items-center justify-center rounded-lg border overflow-auto p-4">
        {selectedDoc ? (
          <Document file={selectedDoc.url}>
            <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={500} />
          </Document>
        ) : (
          <p className="text-gray-400">Select a document to preview</p>
        )}
      </div>
    </div>
  );
}