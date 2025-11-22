from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    nickname: constr(min_length=2, max_length=15, regex="^[a-zA-Z0-9가-힣]+$")
    email: EmailStr
    password: constr(min_length=8)
    age: Optional[int]
    sex: Optional[int]

class UserUpdate(BaseModel):
    name: Optional[str]
    nickname: Optional[constr(min_length=2, max_length=15, regex="^[a-zA-Z0-9가-힣]+$")]
    email: Optional[EmailStr]
    password: Optional[constr(min_length=8)]
    age: Optional[int]
    sex: Optional[int]