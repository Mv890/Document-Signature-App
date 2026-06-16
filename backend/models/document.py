from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Signature(Base):
    __tablename__ = "signatures"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    x_coordinate = Column(Integer)
    y_coordinate = Column(Integer)
    page_number = Column(Integer)
    # New fields for Day 11
    status = Column(String, default="Pending") # Pending, Signed, Rejected
    rejection_reason = Column(String, nullable=True)