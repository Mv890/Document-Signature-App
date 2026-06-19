import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.document import Document
from models.user import User
from utils.auth import get_current_user

router = APIRouter(prefix="/api/docs", tags=["Documents"])
UPLOAD_DIR = "uploads"

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
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
def get_user_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    documents = db.query(Document).filter(Document.owner_id == current_user.id).all()
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "url": f"http://localhost:8000/{doc.file_path.replace(chr(92), '/')}",
            "upload_date": doc.upload_date
        }
        for doc in documents
    ]