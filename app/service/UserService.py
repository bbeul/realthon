from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repository.UserRepository import UserRepository
from app.utils import hash_password
from app.schemas import UserCreate

class UserService:
    def __init__(self, session: AsyncSession):
        self.repo = UserRepository(session)

    async def signup(self, user_data: UserCreate):
        if await self.repo.get_by_email(user_data.email):
            raise HTTPException(status_code=400, detail="Email already exists")
        if await self.repo.get_by_nickname(user_data.nickname):
            raise HTTPException(status_code=400, detail="Nickname already exists")
        hashed = hash_password(user_data.password)
        return await self.repo.create(user_data, hashed)