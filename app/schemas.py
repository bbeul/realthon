from pydantic import BaseModel, EmailStr, constr
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel
from typing_extensions import Literal


# ----------------- User -----------------
class UserCreate(BaseModel):
    name: str
    nickname: constr(min_length=2, max_length=15)
    email: EmailStr
    password: constr(min_length=8)
    age: Optional[int]
    sex: Optional[int]

class UserUpdate(BaseModel):
    name: Optional[str]
    nickname: Optional[constr(min_length=2, max_length=15)]
    email: Optional[EmailStr]
    password: Optional[constr(min_length=8)]
    age: Optional[int]
    sex: Optional[int]

UrgencyLiteral = Literal["low", "medium", "high"]

class SourceInput(BaseModel):
    profile_id: str
    user_id: str
    relevance_score: float


class SourceOutput(SourceInput):
    pass


class QuestionCreate(BaseModel):
    user_id: UUID
    text: str
    tags: Optional[List[str]] = None
    urgency: Optional[UrgencyLiteral] = None
    intent: Optional[str] = None  # 없으면 LLM 결과로 채워도 됨


class QuestionRead(BaseModel):
    id: UUID
    user_id: UUID
    text: str
    tags: Optional[List[str]]
    urgency: Optional[UrgencyLiteral]
    intent: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AnswerCreate(BaseModel):
    query_id: UUID
    text: str
    sources: List[SourceInput]


class ResponseRead(BaseModel):
    id: UUID
    query_id: UUID
    text: str
    sources: Optional[List[SourceOutput]]
    created_at: datetime

    class Config:
        orm_mode = True


class MessagesRead(BaseModel):
    query: QuestionRead
    responses: List[ResponseRead]
