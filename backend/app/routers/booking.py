from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.booking import BookingIn
from app.services.booking_logic import can_book
from app.models.booking import Booking
from app.models.user import User
from app.core.deps import get_user

router = APIRouter()


@router.get("/bookings")
def get_bookings(db: Session = Depends(get_db)):
    return db.query(Booking).all()


@router.post("/bookings")
def create_booking(
    data: BookingIn,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        start_at = data.start_at.replace(tzinfo=None)
        end_at = data.end_at.replace(tzinfo=None)

        ok, msg = can_book(db, data.resource_id, start_at, end_at, user)

        if not ok:
            raise HTTPException(400, msg)

        db.add(Booking(
            user_id=user.id,
            user_name=user.username,
            resource_id=data.resource_id,
            start_at=start_at,
            end_at=end_at,
            title=data.title,
            note=data.note
        ))

        db.commit()
        return {"msg": "ok"}

    except Exception:
        db.rollback()
        raise


@router.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()

        if not booking:
            raise HTTPException(404, "見つからない")

        if booking.user_id != user.id:
            raise HTTPException(403, "自分の予約のみ削除できます")

        db.delete(booking)
        db.commit()

        return {"msg": "deleted"}

    except Exception:
        db.rollback()
        raise

@router.put("/bookings/{booking_id}")
def update_booking(
    booking_id: int,
    data: BookingIn,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(404, "見つからない")

    if booking.user_id != user.id:
        raise HTTPException(403, "自分の予約のみ更新できます")

    booking.start_at = data.start_at.replace(tzinfo=None)
    booking.end_at = data.end_at.replace(tzinfo=None)
    booking.resource_id = data.resource_id
    booking.title = data.title
    booking.note = data.note

    db.commit()

    return {"msg": "updated"}
