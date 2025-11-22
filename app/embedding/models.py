from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class ProfileCreate(BaseModel):
    id: UUID = None
    user_id: UUID
    univ: str
    major: str
    grade: Optional[str] = None
    gpa: str
    company: Optional[str] = None
    job: Optional[str] = None
    ref_score: float
    career_year: Optional[int] = None
    profile_data: Optional[Dict[str, Any]] = None
    profile_tags: List[str]

class UserRead(BaseModel):
    id: UUID
    name: str
    nickname: str
    email: str
    age: int
    sex: int

class ProfileRead(BaseModel):
    id: UUID
    user: UserRead
    univ: str
    major: str
    grade: Optional[str] = None
    gpa: str
    company: Optional[str] = None
    job: Optional[str] = None
    ref_score: float
    career_year: Optional[int] = None
    profile_data: Optional[Dict[str, Any]] = None
    profile_tags: List[str]
    created_at: datetime
    updated_at: datetime


    model_config = {
        "from_attributes": True
    }
