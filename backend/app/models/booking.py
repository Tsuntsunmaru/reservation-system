from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Text
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_name = Column(String)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    start_at = Column(DateTime)
    end_at = Column(DateTime)
    title = Column(String, nullable=True)
    note = Column(Text, nullable=True)
