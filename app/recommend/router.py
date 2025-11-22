
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_db  # get_db는 AsyncSession을 반환해야 합니다.
from app.recommend.services import ChatBotService

router = APIRouter()

class RecommendationRequest(BaseModel):
    query: str

@router.post("/api/recommendations")
async def recommend_seniors(request: RecommendationRequest, db: AsyncSession = Depends(get_db)):
    # 서비스의 run_pipeline을 통해 유저 리스트 반환
    service = ChatBotService()
    users = await service.run_pipeline(request.query, db)
    if not users or isinstance(users, str):
        return JSONResponse(content={"seniors": []})

    # 요약 정보만 추출
    summaries = [
        {
            "id": str(u.id),
            "name": u.name,
            "nickname": u.nickname,
            "email": u.email,
            "age": u.age,
            "sex": u.sex,
        }
        for u in users
    ]
    return JSONResponse(content={"seniors": summaries})