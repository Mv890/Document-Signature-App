# backend/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from models import user, document, signature 
from routers import auth, document as doc_router, signature as sig_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Signature API")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(auth.router)
app.include_router(doc_router.router)
app.include_router(sig_router.router) 

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."}