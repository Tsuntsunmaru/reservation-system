from pydantic import BaseModel
from datetime import datetime

class BookingIn(BaseModel):
    resource_id: int
    start_at: datetime
    end_at: datetime
