from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware # <-- Import CORS
from database import engine, Base
from models import user, document, signature 
from routers import auth, document as doc_router, signature as sig_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Signature API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your Vite React frontend URL
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(doc_router.router)
app.include_router(sig_router.router) 

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."}