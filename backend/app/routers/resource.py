from fastapi import APIRouter
from app.database import SessionLocal
from app.models.resource import Resource

router = APIRouter()

@router.get("/resources")
def get_resources():
    db = SessionLocal()
    return db.query(Resource).all()
