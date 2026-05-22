from sqlalchemy import Column, Integer, String
from app.database import Base

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    type = Column(String)
    color = Column(String)
