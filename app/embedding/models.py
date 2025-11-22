from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID

class ProfileCreate(BaseModel):
    id: UUID
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
