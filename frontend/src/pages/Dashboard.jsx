import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      {/* Main Container with shadow */}
      <div className="max-w-6xl mx-auto flex gap-6 h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Sidebar: Document List */}
        <div className="w-1/3 bg-white border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              My Documents
            </h2>
            <p className="text-sm text-slate-500 mt-1">Select a file to preview and sign</p>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">No documents yet</p>
                <p className="text-sm text-slate-400 mt-1">Upload a PDF to get started.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {documents.map((doc) => (
                  <li 
                    key={doc.id} 
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                      selectedDoc?.id === doc.id 
                        ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-md"
                    }`}
                  >
                    <p className={`font-semibold truncate ${selectedDoc?.id === doc.id ? "text-indigo-900" : "text-slate-700"}`}>
                      {doc.filename}
                    </p>
                    <p className={`text-xs mt-1 ${selectedDoc?.id === doc.id ? "text-indigo-500" : "text-slate-400"}`}>
                      Added {new Date(doc.upload_date).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Panel: PDF Preview */}
        <div className="w-2/3 bg-slate-100 flex items-center justify-center p-8 relative inset-inner-shadow">
          {selectedDoc ? (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
              <Document file={selectedDoc.url}>
                <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={550} />
              </Document>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm mb-4 border border-slate-100">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-600">Document Viewer</p>
              <p className="text-slate-400 text-sm mt-1">Select a document from the sidebar to view it here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}