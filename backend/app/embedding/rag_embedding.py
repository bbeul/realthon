from fastapi import APIRouter, HTTPException, Request
from uuid import UUID, uuid4
from typing import List

from app.embedding.models import ProfileCreate, ProfileRead
from app.embedding.services import ProfileEmbeddingService

router = APIRouter()
embedding_service = ProfileEmbeddingService()

@router.post("/api/profile")
async def create_profile(profile: ProfileCreate):
    if profile.id is None:
        profile.id = uuid4()
    result = await embedding_service.process_and_save(profile)
    return result

@router.get("/api/profiles", response_model=list[ProfileRead])
async def get_profiles():
    return await embedding_service.get_all_profiles()

@router.get("/api/profile/{user_id}", response_model=ProfileRead)
async def get_profile(user_id: UUID):
    profile = await embedding_service.get_profile_by_user_id(str(user_id))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile