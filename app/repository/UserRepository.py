from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from app.model.User import User
from app.schemas import UserCreate, UserUpdate

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    # ------------------ CREATE ------------------
    async def create(self, user_data: UserCreate, hashed_password: str):
        user = User(
            name=user_data.name,
            nickname=user_data.nickname,
            email=user_data.email,
            password=hashed_password,
            age=user_data.age,
            sex=user_data.sex
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    # ------------------ READ ------------------
    async def get_by_email(self, email: str):
        result = await self.session.execute(select(User).filter_by(email=email))
        return result.scalar()

    async def get_by_nickname(self, nickname: str):
        result = await self.session.execute(select(User).filter_by(nickname=nickname))
        return result.scalar()

    async def get_by_id(self, user_id: str):
        result = await self.session.execute(select(User).filter_by(id=user_id))
        return result.scalar()

    async def list_all(self):
        result = await self.session.execute(select(User))
        return result.scalars().all()

    # ------------------ UPDATE ------------------
    async def update(self, user_id: str, update_data: 'UserUpdate'):
        result = await self.session.execute(select(User).filter_by(id=user_id))
        user = result.scalar()
        if not user:
            return None
        for key, value in update_data.dict(exclude_unset=True).items():
            setattr(user, key, value)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    # ------------------ DELETE ------------------
    async def delete(self, user_id: str):
        result = await self.session.execute(select(User).filter_by(id=user_id))
        user = result.scalar()
        if not user:
            return None
        await self.session.delete(user)
        await self.session.commit()
        return user