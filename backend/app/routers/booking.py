from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import SessionLocal
from app.schemas.booking import BookingIn
from app.services.booking_logic import can_book
from app.models.booking import Booking
from app.models.user import User
from app.core.auth import decode_token
from app.core.deps import get_user

router = APIRouter()

@router.get("/bookings")
def get_bookings():
    db = SessionLocal()
    try:
        return db.query(Booking).all()
    finally:
        db.close()


@router.post("/bookings")
def create_booking(data: BookingIn, user: User = Depends(get_user)):
    db = SessionLocal()

    try:
        start_at = data.start_at.replace(tzinfo=None)
        end_at = data.end_at.replace(tzinfo=None)
        
        ok, msg = can_book(
        db,
        data.resource_id,
        start_at,
        end_at,
        user
        )
        
        if not ok:
            raise HTTPException(400, msg)
            
        db.add(Booking(
            user_id=user.id,
            user_name=user.username,
            resource_id=data.resource_id,
            start_at=start_at,
            end_at=end_at
        ))
        
        db.commit()
        return {"msg": "ok"}

    finally:
        db.close()
    
@router.delete("/bookings/{booking_id}")
def delete_booking(booking_id: int ,user: User = Depends(get_user)):
    db = SessionLocal()

    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        
        if not booking:
            raise HTTPException(404, "見つからない")
            
        if booking.user_id != user.id:
            raise HTTPException(403,"自分の予約のみ削除できます")
            
        db.delete(booking)
        db.commit()
        
        return {"msg": "deleted"}
        
    finally:
        db.close()
