from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repository.UserRepository import UserRepository
from app.utils import hash_password
from app.schemas import UserCreate, UserUpdate

class ChatService:
    def __init__(self, session: AsyncSession):
        self.repo = UserRepository(session)

    # ------------------ READ ------------------
    async def get_by_id(self, user_id: str):
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user