from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, UserResponse, Token
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if username or email exists
    if db.query(User).filter(User.username == user_data.username.strip()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken. Please choose another username."
        )
    if db.query(User).filter(User.email == user_data.email.strip().lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login or use another email."
        )

    # Hash password & create user
    hashed = get_password_hash(user_data.password)
    user = User(
        username=user_data.username.strip(),
        email=user_data.email.strip().lower(),
        hashed_password=hashed,
        full_name=user_data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    query_val = login_data.username_or_email.strip()
    user = db.query(User).filter(
        (User.username == query_val) | (User.email == query_val.lower())
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your username/email and password."
        )

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
