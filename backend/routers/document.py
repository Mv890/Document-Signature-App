import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.document import Document
from models.user import User
from utils.auth import get_current_user
from utils.email import generate_signing_link, send_signature_email

router = APIRouter(prefix="/api/docs", tags=["Documents"])
UPLOAD_DIR = "uploads"

class ShareRequest(BaseModel):
    email: str

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_doc = Document(
        filename=file.filename,
        file_path=file_path,
        owner_id=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return {"message": "File uploaded successfully", "document_id": new_doc.id}

@router.get("/")
def get_user_documents(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    documents = db.query(Document).filter(Document.owner_id == current_user.id).all()
    
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "url": f"http://localhost:8000/{doc.file_path}",
            "upload_date": doc.upload_date
        }
        for doc in documents
    ]

@router.post("/{doc_id}/share")
def share_document(
    doc_id: int, 
    request: ShareRequest,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):

    document = db.query(Document).filter(Document.id == doc_id, Document.owner_id == current_user.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    signing_link = generate_signing_link(doc_id=document.id, signer_email=request.email)

    try:
        send_signature_email(
            signer_email=request.email, 
            signing_link=signing_link, 
            document_name=document.filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {
        "message": f"Secure signing link successfully sent to {request.email}",
        "link": signing_link # Returning it here too just for easy testing!
    }