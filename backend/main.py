from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import user, document, signature, audit
from routers import auth, document as doc_router, signature as sig_router, audit as audit_router
from middleware.audit import audit_log_middleware
from starlette.middleware.base import BaseHTTPMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Signature API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(BaseHTTPMiddleware, dispatch=audit_log_middleware)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(doc_router.router)
app.include_router(sig_router.router)
app.include_router(audit_router.router)

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."}