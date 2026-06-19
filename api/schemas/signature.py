from pydantic import BaseModel

class SignatureCreate(BaseModel):
    doc_id: int
    x_coordinate: float
    y_coordinate: float
    page_number: int

class SignatureResponse(BaseModel):
    id: int
    doc_id: int
    user_id: int
    x_coordinate: float
    y_coordinate: float
    page_number: int
    status: str

    class Config:
        orm_mode = True