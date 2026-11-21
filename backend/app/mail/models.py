from sqlalchemy import Column, String, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import sqlalchemy.types as types
import uuid

Base = declarative_base()

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(Text)
    content = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    answers = relationship("Answer", back_populates="question", uselist=False)

class Answer(Base):
    __tablename__ = "answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), unique=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    content = Column(Text)
    is_ai_generated = Column(Boolean, server_default="true")
    created_at = Column(TIMESTAMP, server_default=func.now())

    question = relationship("Question", back_populates="answers")