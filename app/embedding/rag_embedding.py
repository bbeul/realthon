from fastapi import APIRouter, HTTPException, Request
from uuid import uuid4

from app.embedding.models import ProfileCreate
from app.embedding.services import ProfileEmbeddingService

router = APIRouter()

embedding_service = ProfileEmbeddingService()

@router.post("/api/profile")
async def create_profile(profile: ProfileCreate):
    if profile.id is None:
        profile.id = uuid4()
    result = await embedding_service.process_and_save(profile)
    return result

