from fastapi import FastAPI
from database import engine, Base
from models import user, document
from routers import auth, document as doc_router # <-- Import the new routers

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Signature API")

app.include_router(auth.router)
app.include_router(doc_router.router)

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."} 