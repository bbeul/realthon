from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.UserService import UserService
from app.db import get_db
from app.schemas import UserCreate

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/signup")
async def signup(user: UserCreate, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    new_user = await service.signup(user)
    return {
        "id": str(new_user.id),
        "nickname": new_user.nickname,
        "email": new_user.email
    }