from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str
    username: str

class LoginUser(BaseModel):
    email: str
    password: str
