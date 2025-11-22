from fastapi import FastAPI
from app.root import router as root_router

app = FastAPI()
app.include_router(root_router)


