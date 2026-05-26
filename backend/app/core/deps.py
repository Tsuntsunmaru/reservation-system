from fastapi import Header
from app.database import SessionLocal
from app.models.user import User
from app.core.auth import decode_token

def get_user(authorization: str = Header(None),db: Session = Depends(get_db)):

    if not authorization:
        return db.query(User).first()

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    return db.query(User).get(payload["user_id"])
