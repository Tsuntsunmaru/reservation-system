from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.booking import BookingIn
from app.services.booking_logic import can_book
from app.models.booking import Booking
from app.models.user import User
from app.core.deps import get_user, is_admin, is_hq, is_leader
from app.models.resource import Resource

router = APIRouter()

@router.get("/bookings")
def get_bookings(center: str, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.center == center).all()

    result = []

    for b in bookings:
        try:
            result.append({
                "id": b.id,
                "title": b.title or "予約",
                "start_at": str(b.start_at),
                "end_at": str(b.end_at),
                "resource_id": b.resource_id,
                "user_name": b.user_name,
                "note": b.note
            })
        except:
            continue

    return result


def can_book(db, resource_id, start_at, end_at, user, booking_id=None):
    q = db.query(Booking).filter(
        Booking.resource_id == resource_id,
        Booking.start_at < end_at,
        Booking.end_at > start_at
    )

    if booking_id is not None:
        q = q.filter(Booking.id != int(booking_id))

    existing = q.first()

    if existing:
        return False, "その時間は既に予約があります"

    return True, "ok"

@router.post("/bookings")
def create_booking(
    data: BookingIn,
    user: User = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        start_at = data.start_at.replace(tzinfo=None)
        end_at = data.end_at.replace(tzinfo=None)

        resource = db.query(Resource).get(data.resource_id)

        if not resource:
            raise HTTPException(404, "resourceが見つからない")

        if user.role not in ["admin", "hq", "leader"]:
            if resource.center != user.center:
                raise HTTPException(403, "他センター予約不可")

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
            note=data.note,
            center=resource.center
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
        booking = db.query(Booking).get(Booking.id)
        print("ROLE:", "[" + user.role + "]")
        if not booking:
            raise HTTPException(404, "見つからない")

        resource = db.query(Resource).get(booking.resource_id)
        if not resource:
            raise HTTPException(404, "resource not found")
        
        if user.role == "admin":
            pass

        elif user.role == "leader":
            if resource.center != user.center:
                raise HTTPException(403, "他センター削除不可")

        elif user.role == "hq":
            if booking.user_id != user.id:
                raise HTTPException(403, "自分の予約のみ削除可能")

        else:
            if booking.user_id != user.id:
                raise HTTPException(403, "自分の予約のみ削除可能")

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

    if booking.user_id != user.id and user.role.strip().lower() != "admin":
            raise HTTPException(403, "削除権限がありません")

    start_at = data.start_at.replace(tzinfo=None)
    end_at = data.end_at.replace(tzinfo=None)

    ok, msg = can_book(
        db,
        data.resource_id,
        start_at,
        end_at,
        user,
        booking_id=booking_id   # ✅ これが超重要
    )

    if not ok:
        raise HTTPException(400, msg)
        
    booking.start_at = start_at
    booking.end_at = end_at
    booking.resource_id = data.resource_id
    booking.title = data.title
    booking.note = data.note
    booking.center = data.center

    db.commit()

    return {"msg": "updated"}
