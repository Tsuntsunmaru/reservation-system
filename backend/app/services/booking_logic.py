def overlap(a_start, a_end, b_start, b_end):
    return not (a_end <= b_start or a_start >= b_end)

def can_book(db, resource_id, start_at, end_at, user):

    from app.models.booking import Booking
    from app.models.blocked import BlockedSlot
    from app.models.holiday import Holiday

    # 休日
    holiday = db.query(Holiday).filter(
        Holiday.date == str(start_at.date())
    ).first()

    if holiday and holiday.is_blocked:
        return False, "休日NG"

    # NG
    blocks = db.query(BlockedSlot).all()
    for b in blocks:
        if b.resource_id is None or b.resource_id == resource_id:
            if overlap(start_at, end_at, b.start_at, b.end_at):
                return False, "NG時間"

    # 予約衝突
    bookings = db.query(Booking).filter(
        Booking.resource_id == resource_id
    ).all()

    for b in bookings:
        if overlap(start_at, end_at, b.start_at, b.end_at):
            return False, "予約あり"

    return True, "OK"

    # 外部ユーザー制限追加
    if user.role == "external":
        # 他の予約が1件でもあればNG
        if bookings:
            return False, "外部予約不可（埋まってる）"
