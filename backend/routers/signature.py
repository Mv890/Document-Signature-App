import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.document import Document
from models.signature import Signature
from schemas.signature import SignatureCreate
from utils.auth import get_current_user
from utils.pdf import stamp_signature_on_pdf

router = APIRouter(prefix="/api/signatures", tags=["Signatures"])

@router.post("/")
def save_signature_position(
    signature_data: SignatureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_sig = Signature(
        doc_id=signature_data.doc_id,
        user_id=current_user.id,
        x_coordinate=signature_data.x_coordinate,
        y_coordinate=signature_data.y_coordinate,
        page_number=signature_data.page_number,
        status="Pending"
    )
    db.add(new_sig)
    db.commit()
    db.refresh(new_sig)
    return {"message": "Signature position saved", "signature_id": new_sig.id}

@router.post("/finalize/{doc_id}")
def finalize_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    signature = db.query(Signature).filter(Signature.doc_id == doc_id).first()
    if not signature:
        raise HTTPException(status_code=400, detail="No signature coordinates mapped for this document")

    input_path = document.file_path
    filename_parts = os.path.splitext(document.filename)
    signed_filename = f"{filename_parts[0]}_signed{filename_parts[1]}"
    signed_filepath = os.path.join("uploads", signed_filename)

    try:
        stamp_signature_on_pdf(
            input_path=input_path,
            output_path=signed_filepath,
            x=signature.x_coordinate,
            y=signature.y_coordinate,
            signature_text=f"Digitally Signed by {current_user.name}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate final PDF: {str(e)}")

    document.file_path = signed_filepath
    document.filename = signed_filename
    signature.status = "Signed"
    db.commit()

    return {
        "message": "Document successfully signed and finalized!",
        "document_url": f"http://localhost:8000/{signed_filepath}"
    }