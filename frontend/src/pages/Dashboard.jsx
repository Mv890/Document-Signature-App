import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function SignatureDraggable({ position, signatureImage, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: "sig-1" });
  const style = {
    position: "absolute",
    transform: CSS.Translate.toString(transform),
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 100,
    cursor: "grab"
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={onClick} className="touch-none select-none">
      {signatureImage ? (
        <img src={signatureImage} alt="Signature" style={{ width: '150px', height: 'auto', border: '2px solid black', backgroundColor: 'white' }} />
      ) : (
        <div className="border-2 border-dashed border-indigo-600 bg-indigo-100 text-indigo-900 px-6 py-3 font-bold rounded shadow-xl cursor-pointer">✍️ Click to Sign</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 50 });
  const [signatureImage, setSignatureImage] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  
  const sigPad = useRef(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("signature_app_token");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const fetchDocs = async () => {
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/docs/`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.map(d => ({ ...d, url: d.url.startsWith('http') ? d.url : `${API_BASE_URL}${d.url}` })));
      }
    };
    fetchDocs();
  }, [token]);

  const saveSignature = () => {
    if (!sigPad.current || sigPad.current.isEmpty()) return alert("Draw signature first!");
    setSignatureImage(sigPad.current.toDataURL("image/png"));
    setShowCanvas(false);
  };

  const downloadSignedDocument = async () => {
    if (!signatureImage || !selectedDoc) return alert("Sign and select a doc!");

    const existingPdfBytes = await fetch(selectedDoc.url).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { height } = page.getSize();
    
    // Stamp signature onto the existing PDF
    page.drawImage(pngImage, {
      x: sigPosition.x,
      y: height - sigPosition.y - 50,
      width: 100,
      height: 50,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `signed_${selectedDoc.filename}`;
    link.click();
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {showCanvas && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg">
            <SignatureCanvas ref={sigPad} canvasProps={{width: 500, height: 200, className: 'border'}} />
            <div className="mt-4 flex gap-4">
              <button onClick={() => sigPad.current.clear()} className="bg-red-500 text-white px-4 py-2 rounded">Clear</button>
              <button onClick={saveSignature} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="w-1/3 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6">Documents</h2>
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white py-3 rounded-lg">+ Upload</button>
          <input type="file" ref={fileInputRef} className="hidden" />
          <button onClick={downloadSignedDocument} className="w-full mt-2 bg-indigo-600 text-white py-3 rounded-lg">📥 Download PDF</button>
          <div className="mt-6">
            {documents.map(doc => (
              <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="p-4 bg-slate-50 border mb-3 cursor-pointer rounded">{doc.filename}</div>
            ))}
          </div>
        </div>
        
        <div className="w-2/3 bg-white p-6 rounded-xl shadow-md min-h-[600px] relative border">
          {selectedDoc ? (
            <DndContext sensors={sensors} onDragEnd={(e) => setSigPosition(p => ({ x: p.x + e.delta.x, y: p.y + e.delta.y }))}>
              <div className="relative">
                <Document file={selectedDoc.url}><Page pageNumber={1} width={500} /></Document>
                <SignatureDraggable position={sigPosition} signatureImage={signatureImage} onClick={() => setShowCanvas(true)} />
              </div>
            </DndContext>
          ) : <p className="text-slate-400">Select a document.</p>}
        </div>
      </div>
    </div>
  );
}