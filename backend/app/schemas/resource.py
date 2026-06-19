from pydantic import BaseModel

class ResourceCreate(BaseModel):
    name: str
    center: str
