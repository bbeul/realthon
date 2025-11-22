from fastapi import FastAPI
from app.root import router as root_router
from app.embedding.rag_embedding import router as embedding_router

app = FastAPI()
app.include_router(root_router)
app.include_router(embedding_router)

