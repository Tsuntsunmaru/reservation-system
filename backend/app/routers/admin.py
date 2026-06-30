from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import SessionLocal
from app.models.resource import Resource
from app.models.blocked import BlockedSlot
from app.models.holiday import Holiday
from sqlalchemy.orm import Session
from app.models.booking import Booking
from app.models.user import User
from app.core.auth import decode_token
from fastapi.security import HTTPBearer
from app.database import get_db
from app.core.deps import get_user, is_admin, is_hq, is_leader

router = APIRouter()

security = HTTPBearer()

def admin_user(
    credentials=Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(401, "トークン無効")

    user = db.query(User).get(payload.get("user_id"))

    if not user:
        raise HTTPException(401, "ユーザーが存在しません")

    if user.role != "admin":
        raise HTTPException(403, "権限なし")

    return user


@router.post("/admin/resources")
def create_resource(
    name: str, type: str, center: str,user: User = Depends(admin_user),
    db: Session = Depends(get_db)
):
    db.add(Resource(name=name, type=type,center=center))
    db.commit()
    return {"msg": "ok"}

@router.post("/admin/block")
def block(
    resource_id: int, start_at: str, end_at: str, user: User = Depends(admin_user),
    db: Session = Depends(get_db)
):
    db.add(BlockedSlot(resource_id=resource_id, start_at=start_at, end_at=end_at))
    db.commit()
    return {"msg": "ok"}

@router.post("/admin/holiday")
def holiday(date: str, user: User = Depends(admin_user),
            db: Session = Depends(get_db)
           ):
    db.add(Holiday(date=date, is_blocked=1))
    db.commit()
    return {"msg": "ok"}

@router.get("/admin/blocks")
def get_blocks(
    user: User = Depends(admin_user),
    db: Session = Depends(get_db)
):
    return db.query(BlockedSlot).all()

@router.get("/admin/holidays")
def get_holidays(
    user: User = Depends(admin_user),
    db: Session = Depends(get_db)
):
    return db.query(Holiday).all()


@router.post("/admin/change-role")
def change_role(
    email: str,
    role: str,
    center: str,  
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    if user.role != "admin":
        raise HTTPException(403, "権限なし")

    target = db.query(User).filter(User.email == email).first()
    if not target:
        raise HTTPException(404, "ユーザーが見つかりません")

    target.role = role

    target.center = center

    db.commit()

    return {"msg": "updated"}




@router.get("/admin/export-all")
def export_all(db: Session = Depends(get_db)):
    users = db.query(User).all()
    resources = db.query(Resource).all()
    bookings = db.query(Booking).all()

    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "password": u.password,
                "role": u.role,
                "center": u.center,
            }
            for u in users
        ],
        "resources": [
            {
                "id": r.id,
                "name": r.name,
                "type": r.type,
                "center": r.center,
            }
            for r in resources
        ],
        "bookings": [
            {
                "id": b.id,
                "user_id": b.user_id,
                "user_name": b.user_name,
                "resource_id": b.resource_id,
                "start_at": b.start_at.isoformat() if b.start_at else None,
                "end_at": b.end_at.isoformat() if b.end_at else None,
                "title": b.title,
                "note": b.note,
                "center": b.center,
            }
            for b in bookings
        ],
    }
