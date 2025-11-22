# app/api/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

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
@router.post("/questions", response_model=QuestionRead)
async def create_question(
    payload: QuestionCreate,
    session: AsyncSession = Depends(get_db),
):
    query = Query(
        user_id=payload.user_id,
        text=payload.text,
        tags=payload.tags
    )
    session.add(query)
    await session.commit()
    await session.refresh(query)
    return query


# 2) 답변 생성: POST /chat/answers
@router.post("/answers", response_model=ResponseRead)
async def create_answer(
    payload: AnswerCreate,
    session: AsyncSession = Depends(get_db),
):
    # 관련 query 존재 여부 체크
    result = await session.execute(
        select(Query).where(Query.id == payload.query_id)
    )
    query = result.scalar_one_or_none()
    if query is None:
        raise HTTPException(status_code=404, detail="Query not found")

    sources_json = [
        {
            "profile_id": src.profile_id,
            "user_id": src.user_id,
            "relevance_score": src.relevance_score,
        }
        for src in payload.sources
    ]

    response = Response(
        query_id=payload.query_id,
        text=payload.text,
        sources=sources_json,
    )
    session.add(response)
    await session.commit()
    await session.refresh(response)

    sources_out = [
        SourceOutput(**src_dict) for src_dict in (response.sources or [])
    ]

    return ResponseRead(
        id=response.id,
        query_id=response.query_id,
        text=response.text,
        sources=sources_out,
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
