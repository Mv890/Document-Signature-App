from fastapi import FastAPI

app = FastAPI(title="Document Signature API")

@app.get("/")
def read_root():
    return {"message": "Backend is running securely."}