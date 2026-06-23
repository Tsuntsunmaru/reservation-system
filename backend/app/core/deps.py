from fastapi.security import HTTPBearer
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.auth import decode_token

security = HTTPBearer()

def get_user(credentials=Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_token(token)
    return db.query(User).get(payload["user_id"])

def is_admin(user):
    return user.role == "admin"

def is_hq(user):
    return user.role == "hq"

def is_leader(user):
    return user.role == "leader"
