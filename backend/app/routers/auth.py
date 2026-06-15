from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.booking import Booking
from app.core.auth import *
from app.schemas.user import UserCreate, LoginUser
from app.core.deps import get_user
from pydantic import BaseModel

router = APIRouter()

@router.options("/login")
def options_login():
    return {}

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = User(
            email=user.email,
            username=user.username,
            password=hash_password(user.password),
            role="user"
        )
        db.add(new_user)
        db.commit()
        
        return {"msg": "ok"}
    except Exception:
        db.rollback()
        raise


@router.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    return {"token": create_token({"user_id": db_user.id,"role":db_user.role})}


@router.put("/users/me")
def update_user(
    username: str,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        db_user = db.query(User).filter(User.id == user.id).first()
        
        if not db_user:
            raise HTTPException(404, "ユーザーが見つかりません")
            
        db_user.username = username
            
        bookings = db.query(Booking).filter(Booking.user_id == user.id).all()
        for b in bookings:
            b.user_name = username
        
        db.commit()
                
        return {"msg": "updated"}
    except Exception:
        db.rollback()
        raise


@router.put("/users/password")
def update_password(
    data: PasswordUpdate,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        db_user = db.query(User).filter(User.id == user.id).first()
        
        if not db_user:
            raise HTTPException(404, "ユーザーが見つかりません")
            
        if not verify_password(data.old_password, db_user.password):
            raise HTTPException(400, "現在のパスワードが違います")
            
        db_user.password = hash_password(data.new_password)
        
        db.commit()
        
        return {"msg": "パスワード変更成功"}
    except Exception:
        db.rollback()
        raise


class AdminPasswordUpdate(BaseModel):
    email: str
    new_password: str


@router.put("/admin/users/password")
def admin_update_password(
    data: AdminPasswordUpdate,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        if user.role != "admin":
            raise HTTPException(403, "権限がありません")

        db_user = db.query(User).filter(User.email == data.email).first()

        if not db_user:
            raise HTTPException(404, "ユーザーが見つかりません")

        db_user.password = hash_password(data.new_password)

        db.commit()

        return {"msg": "管理者によるパスワード変更成功"}

    except Exception:
        db.rollback()
        raise
