#root.py
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import AsyncSessionLocal
from sqlalchemy import text

router = APIRouter()

@router.get("/")
def root():
    return JSONResponse(content={"message": "Hello, FastAPI!"})

@router.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok"})

# ---- DB 연결 테스트 ----
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/db-test")
async def db_test():
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT * from profile"))
        return JSONResponse(content={"db": "ok"})
    except Exception as e:
        return JSONResponse(content={"db": "fail", "error": str(e)}, status_code=500)