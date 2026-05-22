from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.models.user import User
from app.core.auth import *
from app.schemas.user import UserCreate, LoginUser
from fastapi import Depends
from app.routers.booking import get_user 

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    db = SessionLocal()

    new_user = User(
        email=user.email,
        username=user.username,
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

    if not db_user or not verify_password(user.password,db_user.password):
        raise HTTPException(status_code=401, detail="Unauthorized")

    return {"token": create_token({"user_id": db_user.id})}

@router.put("/users/me")
def update_user(username: str, user: User = Depends(get_user)):
    db = SessionLocal()

    db_user = db.query(User).filter(User.id == user.id).first()

    if not db_user:
        raise HTTPException(404, "ユーザーが見つかりません")

    db_user.username = username
    db.commit()

    return {"msg": "updated"}
