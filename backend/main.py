from fastapi import FastAPI
from database import engine, Base
from models import user
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Signature API")

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."} 