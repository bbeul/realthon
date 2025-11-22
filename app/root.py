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


