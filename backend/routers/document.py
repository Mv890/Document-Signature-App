import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.document import Document
from utils.auth import get_current_user

router = APIRouter(prefix="/api/docs", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: any = Depends(get_current_user)
):
    os.makedirs("uploads", exist_ok=True)
    
    clean_filename = file.filename.replace(" ", "_")
    file_path = os.path.join("uploads", clean_filename)
    
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)
        
    # FIXED: Changed user_id to owner_id to match your database model schema
    new_doc = Document(
        filename=clean_filename,
        file_path=file_path,
        owner_id=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return {
        "id": new_doc.id, 
        "filename": new_doc.filename, 
        "file_path": new_doc.file_path
    }

@router.get("/")
async def get_documents(
    db: Session = Depends(get_db), 
    current_user: any = Depends(get_current_user)
):
    # FIXED: Changed Document.user_id to Document.owner_id to match database lookup keys
    return db.query(Document).filter(Document.owner_id == current_user.id).all()