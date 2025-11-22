# app/models.py
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from app.model.User import Base

# from app.db import Base
Base = Base


class Query(Base):
    __tablename__ = "query"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    text = Column(String, nullable=False)
    #tags = Column(JSONB, nullable=True)  # 예: ["취업", "포트폴리오"]

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    responses = relationship("Response", back_populates="query")


class Response(Base):
    __tablename__ = "response"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(UUID(as_uuid=True), ForeignKey("query.id"), nullable=False)

    text = Column(String, nullable=False)
    # [{profile_id, user_id, relevance_score, ...}] 형태 JSON 리스트
    sources = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    query = relationship("Query", back_populates="responses")
