#root.py
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.db import AsyncSessionLocal

router = APIRouter()

@router.get("/")
def root():
    return JSONResponse(content={"message": "Hello, FastAPI!"})

@router.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok"})

@router.get("/db-test")
async def db_test():
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT * from profile"))
        return JSONResponse(content={"db": "ok"})
    except Exception as e:
        return JSONResponse(content={"db": "fail", "error": str(e)}, status_code=500)
