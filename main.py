from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.root import router as root_router
from app.controller.UserController import router as user_router
from app.embedding.rag_embedding import router as embedding_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용, 필요에 따라 수정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(root_router)
app.include_router(user_router)
app.include_router(embedding_router)