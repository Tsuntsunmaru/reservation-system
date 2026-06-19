
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resource import Resource

router = APIRouter()

@router.get("/resources")
def get_resources(center: str, db: Session = Depends(get_db)):
    return db.query(Resource)\
    .filter(Resource.center == center)\
    .all()
