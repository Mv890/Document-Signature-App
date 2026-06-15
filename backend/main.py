import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from models import user, document, signature, audit 
from routers import auth, document as doc_router, signature as sig_router, audit as audit_router 
from middleware.audit import audit_log_middleware 

Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="Document Signature API")

@app.middleware("http")
async def middle_router(request: Request, call_next):
    return await audit_log_middleware(request, call_next)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(doc_router.router)
app.include_router(sig_router.router)
app.include_router(audit_router.router) 

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."}