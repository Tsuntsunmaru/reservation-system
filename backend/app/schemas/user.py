from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str
    username: str
    center: str
    role: str = "user"

class LoginUser(BaseModel):
    email: str
    password: str
