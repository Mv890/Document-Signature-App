from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.audit import AuditLog
from models.user import User
from utils.auth import get_current_user

router = APIRouter(prefix="/api/audit", tags=["Audit"])

@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Fetch all audit logs ordered by the newest first
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return logs