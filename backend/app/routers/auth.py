from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.models.user import User
from app.core.auth import *

router = APIRouter()

@router.post("/register")
def register(email: str, password: str):
    db = SessionLocal()
    db.add(User(email=email, password=hash_password(password)))
    db.commit()
    return {"msg": "ok"}

@router.post("/login")
def login(email: str, password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(401)

    return {"token": create_token({"user_id": user.id})}
