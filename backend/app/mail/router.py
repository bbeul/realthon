from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db import get_db
from app.mail.models import Question, Answer
import uuid

router = APIRouter(prefix="/api", tags=["mail"])

# 질문 생성
@router.post("/questions/")
async def create_question(created_by: uuid.UUID, title: str, content: str, db: AsyncSession = Depends(get_db)):
    question = Question(created_by=created_by, title=title, content=content)
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question

# 질문 조회
@router.get("/questions/{question_id}")
async def get_question(question_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

# 답변 생성
@router.post("/answers/")
async def create_answer(question_id: uuid.UUID, created_by: uuid.UUID = None, content: str = "", db: AsyncSession = Depends(get_db)):
    answer = Answer(question_id=question_id, created_by=created_by, content=content)
    db.add(answer)
    await db.commit()
    await db.refresh(answer)
    return answer

# 답변 조회
@router.get("/answers/{answer_id}")
async def get_answer(answer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Answer).where(Answer.id == answer_id))
    answer = result.scalar_one_or_none()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    return answer