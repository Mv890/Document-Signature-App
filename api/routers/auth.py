from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.user import User
from utils.auth import authenticate_user, create_access_token, get_password_hash

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if a user with this email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        name=user.name, 
        email=user.email, 
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id}

@router.post("/login")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # DEBUG: See what is coming into the backend
    print(f"DEBUG: Attempting login for email: {form_data.username}")
    
    user = authenticate_user(db, form_data.username, form_data.password)
    
    # DEBUG: See what authenticate_user returned
    if not user:
        print("DEBUG: Authentication failed! User not found or password incorrect.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"DEBUG: Authentication successful for user: {user.email}")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}