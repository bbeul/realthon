from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.UserService import UserService
from app.db import get_db
from app.schemas import UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

# ------------------ CREATE ------------------
@router.post("/signup")
async def signup(user: UserCreate, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    new_user = await service.signup(user)
    return {
        "id": str(new_user.id),
        "nickname": new_user.nickname,
        "email": new_user.email
    }

# ------------------ READ ------------------
@router.get("/{user_id}")
async def get_user_by_id(user_id: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    user = await service.get_by_id(user_id)
    return {
        "id": str(user.id),
        "nickname": user.nickname,
        "email": user.email
    }

@router.get("/email/{email}")
async def get_user_by_email(email: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    user = await service.get_by_email(email)
    return {
        "id": str(user.id),
        "nickname": user.nickname,
        "email": user.email
    }

@router.get("/nickname/{nickname}")
async def get_user_by_nickname(nickname: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    user = await service.get_by_nickname(nickname)
    return {
        "id": str(user.id),
        "nickname": user.nickname,
        "email": user.email
    }

@router.get("/")
async def list_users(session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    users = await service.list_all()
    return [
        {
            "id": str(user.id),
            "nickname": user.nickname,
            "email": user.email
        } for user in users
    ]

# ------------------ UPDATE ------------------
@router.put("/{user_id}")
async def update_user(user_id: str, update_data: UserUpdate, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    updated_user = await service.update(user_id, update_data)
    return {
        "id": str(updated_user.id),
        "nickname": updated_user.nickname,
        "email": updated_user.email
    }

# ------------------ DELETE ------------------
@router.delete("/{user_id}")
async def delete_user(user_id: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    deleted_user = await service.delete(user_id)
    return {
        "id": str(deleted_user.id),
        "nickname": deleted_user.nickname,
        "email": deleted_user.email
    }