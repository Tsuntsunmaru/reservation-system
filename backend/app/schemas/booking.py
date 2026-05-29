from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingIn(BaseModel):
    resource_id: int
    start_at: datetime
    end_at: datetime
    title: Optional[str] = None
    note: Optional[str] = None
    all_day: bool
