from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import SessionLocal
from app.models.resource import Resource
from app.models.blocked import BlockedSlot
from app.models.holiday import Holiday
from app.models.user import User
from app.core.auth import decode_token
from fastapi.security import HTTPBearer
from app.database import get_db

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
@router.post("/admin/promote")
def promote_user(email: str):
    db: Session = Depends(get_db)

    target = db.query(User).filter(User.email == email).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.role = "admin"
    db.commit()

    return {"msg": "promoted to admin"}
