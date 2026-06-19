import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware # Fixed missing import

# Import your database and models
from database import engine, Base
from models import user, document, signature, audit

# Import routers and middleware (Ensure these files exist in the folders specified)
from routers import auth, document as doc_router, signature as sig_router, audit as audit_router
from middleware.audit import audit_log_middleware

# 1. Ensure 'uploads' directory exists before mounting
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Signature API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(BaseHTTPMiddleware, dispatch=audit_log_middleware)

# 2. Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(doc_router.router)
app.include_router(sig_router.router)
app.include_router(audit_router.router)

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."}