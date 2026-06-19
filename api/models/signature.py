from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Signature(Base):
    __tablename__ = "signatures"
    
    # FIX: This prevents the "Table is already defined" crash
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    x_coordinate = Column(Integer)
    y_coordinate = Column(Integer)
    page_number = Column(Integer)
    
    # Day 11 Status Fields
    status = Column(String, default="Pending")
    rejection_reason = Column(String, nullable=True)

    # Relationships
    user = relationship("User")