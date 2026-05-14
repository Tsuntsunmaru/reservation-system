from sqlalchemy import Column, Integer, DateTime
from app.database import Base

class BlockedSlot(Base):
    __tablename__ = "blocked_slots"
    id = Column(Integer, primary_key=True)
    resource_id = Column(Integer, nullable=True)
    start_at = Column(DateTime)
    end_at = Column(DateTime)
