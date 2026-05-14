from sqlalchemy import Column, Integer, String
from app.database import Base

class Holiday(Base):
    __tablename__ = "holidays"
    id = Column(Integer, primary_key=True)
    date = Column(String)
    is_blocked = Column(Integer, default=1)
