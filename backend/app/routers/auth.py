from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.models.user import User
from app.core.auth import *

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    db = SessionLocal()

    new_user = User(
        email=user.email,
        password=hash_password(user.password),
        role="user"
    )

    db.add(new_user)
    db.commit()

    return {"msg": "ok"}

@router.post("/login")
def login(user: LoginUser):
    db = SessionLocal()

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(401)

    return {"token": create_token({"user_id": db_user.id})}
