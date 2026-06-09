from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Signature(Base):
    __tablename__ = "signatures"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    x_coordinate = Column(Float, nullable=False)
    y_coordinate = Column(Float, nullable=False)
    page_number = Column(Integer, nullable=False, default=1)
    status = Column(String, default="Pending") # Pending, Signed, Rejected

    document = relationship("Document")
    user = relationship("User")