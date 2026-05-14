from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import SessionLocal
from app.schemas.booking import BookingIn
from app.services.booking_logic import can_book
from app.models.booking import Booking
from app.models.user import User
from app.core.auth import decode_token

router = APIRouter()

def get_user(token: str = Header()):
    payload = decode_token(token)
    db = SessionLocal()
    return db.query(User).get(payload["user_id"])

@router.get("/bookings")
def get_bookings():
    db = SessionLocal()
    return db.query(Booking).all()

@router.post("/bookings")
def create_booking(data: BookingIn, user: User = Depends(get_user)):
    db = SessionLocal()

    ok, msg = can_book(
        db,
        data.resource_id,
        data.start_at,
        data.end_at,
        user
    )

    if not ok:
        raise HTTPException(400, msg)

    db.add(Booking(
        user_id=user.id,
        resource_id=data.resource_id,
        start_at=data.start_at,
        end_at=data.end_at
    ))

    db.commit()
    return {"msg": "ok"}
