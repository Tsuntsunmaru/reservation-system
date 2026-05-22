from datetime import datetime

def overlap(a_start, a_end, b_start, b_end):
    return not (a_end <= b_start or a_start >= b_end)


def can_book(db, resource_id, start_at, end_at, user):

    from app.models.booking import Booking
    from app.models.blocked import BlockedSlot
    from app.models.holiday import Holiday

    # ✅ 入力統一（重要）
    if start_at is None or end_at is None:
        return False, "時間が不正です"

    start_at = start_at.replace(tzinfo=None)
    end_at = end_at.replace(tzinfo=None)

    # ✅ ユーザーチェック（今回の落とし穴対策）
    if user is None:
        return False, "ユーザー取得エラー"

    # ✅ 過去チェック
    if start_at < datetime.utcnow():
        return False, "過去の時間は予約できません"

    # ✅ 時間逆転チェック
    if end_at <= start_at:
        return False, "終了時間は開始時間より後にしてください"

    # ✅ 休日チェック
    holiday = db.query(Holiday).filter(
        Holiday.date == str(start_at.date())
    ).first()

    if holiday and holiday.is_blocked:
        return False, "休日NG"

    # ✅ NG時間（BlockedSlot）
    blocks = db.query(BlockedSlot).all()
    for b in blocks:

        if b.start_at is None or b.end_at is None:
            continue

        if b.resource_id != resource_id:
            continue

        b_start = b.start_at.replace(tzinfo=None)
        b_end = b.end_at.replace(tzinfo=None)

        
            if overlap(start_at, end_at, b_start, b_end):
                return False, "NG時間"

    # ✅ 予約衝突（Booking）
    bookings = db.query(Booking).filter(
        Booking.resource_id == resource_id
    ).all()

    for b in bookings:

        # ✅ NULL保護
        if b.start_at is None or b.end_at is None:
            continue

        b_start = b.start_at.replace(tzinfo=None)
        b_end = b.end_at.replace(tzinfo=None)

        if overlap(start_at, end_at, b_start, b_end):
            return False, "予約あり"

    # ✅ 外部ユーザー制限
    if user.role == "external":
        if bookings:
            return False, "外部予約不可"

    return True, "OK"
