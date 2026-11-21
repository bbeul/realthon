from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repository.UserRepository import UserRepository
from app.utils import hash_password
from app.schemas import UserCreate, UserUpdate

class UserService:
    def __init__(self, session: AsyncSession):
        self.repo = UserRepository(session)

    # ------------------ CREATE ------------------
    async def signup(self, user_data: UserCreate):
        if await self.repo.get_by_email(user_data.email):
            raise HTTPException(status_code=400, detail="Email already exists")
        if await self.repo.get_by_nickname(user_data.nickname):
            raise HTTPException(status_code=400, detail="Nickname already exists")
        hashed = hash_password(user_data.password)
        return await self.repo.create(user_data, hashed)

    # ------------------ READ ------------------
    async def get_by_id(self, user_id: str):
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def get_by_email(self, email: str):
        user = await self.repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def get_by_nickname(self, nickname: str):
        user = await self.repo.get_by_nickname(nickname)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def list_all(self):
        return await self.repo.list_all()

    # ------------------ UPDATE ------------------
    async def update(self, user_id: str, update_data: UserUpdate):
        user = await self.repo.update(user_id, update_data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    # ------------------ DELETE ------------------
    async def delete(self, user_id: str):
        user = await self.repo.delete(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user