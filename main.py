#main.py
from fastapi import FastAPI
from app.root import router as root_router
from app.controller.UserController import router as user_router
# from app.embedding.rag_embedding import router as embedding_router
from app.controller.ChatController import router as chat_router

app = FastAPI()
app.include_router(root_router)
app.include_router(user_router)
# app.include_router(embedding_router)
app.include_router(chat_router)
