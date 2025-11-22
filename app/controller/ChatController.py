# app/api/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.chatbot.services import ChatBotService
from uuid import UUID

from app.db import get_db
from app.model.Chat import Query, Response
from app.schemas import (
    QuestionCreate,
    QuestionRead,
    AnswerCreate,
    ResponseRead,
    MessagesRead,
    SourceOutput,
)

router = APIRouter(prefix="/chat", tags=["chat"])


# ------------------ CREATE ------------------

# 1) 질문 생성: POST /chat/questions
@router.post("/questions")
async def create_question(
    payload: QuestionCreate,
    db: AsyncSession = Depends(get_db)
):
    query = Query(
        user_id=payload.user_id,
        text=payload.text
    )
    db.add(query)
    await db.commit()
    await db.refresh(query)

    chatbot_service = ChatBotService()

    query_id = query.id
    question_text = query.text

    answer = await chatbot_service.run_pipeline(query_id,question_text)
    return answer


# 2) 답변 생성: POST /chat/answers
@router.post("/answers", response_model=ResponseRead)
async def create_answer(
    # query_id: UUID,
    payload: AnswerCreate,
    session: AsyncSession = Depends(get_db),
):
    # 관련 query 존재 여부 체크
    # result = await session.execute(
    #     select(Query).where(Query.id == payload.query_id)
    # )

    query = result.scalar_one_or_none()
    if query is None:
        raise HTTPException(status_code=404, detail="Query not found")

    # 2) Response 저장 (sources는 안 씀 → 기본값 NULL)
    response = Response(
        query_id=payload.query_id,
        text=payload.text
    )
    session.add(response)
    await session.commit()
    await session.refresh(response)

    # 3) 원하는 형태로 응답
    return ResponseRead(
        id=str(response.id),
        query_id=str(response.query_id),
        text=response.text,
        created_at=response.created_at,
    )

# ------------------ READ ------------------

# 3) 메시지 조회: GET /chat/messages/{query_id}
@router.get("/messages/{query_id}", response_model=MessagesRead)
async def get_messages(
    query_id: str,
    session: AsyncSession = Depends(get_db),
):
    # 질문
    result = await session.execute(
        select(Query).where(Query.id == query_id)
    )
    query = result.scalar_one_or_none()
    if query is None:
        raise HTTPException(status_code=404, detail="Query not found")

    # 답변들
    result_responses = await session.execute(
        select(Response)
        .where(Response.query_id == query_id)
        .order_by(Response.created_at.asc())
    )
    responses = result_responses.scalars().all()

    response_items: list[ResponseRead] = []
    for res in responses:
        sources_out = [
            SourceOutput(**src_dict) for src_dict in (res.sources or [])
        ]
        response_items.append(
            ResponseRead(
                id=res.id,
                query_id=res.query_id,
                text=res.text,
                sources=sources_out,
                created_at=res.created_at,
            )
        )

    return MessagesRead(
        query=query,
        responses=response_items,
    )
