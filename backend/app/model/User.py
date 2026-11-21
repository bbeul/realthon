import sqlalchemy as sa
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "user"

    id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    password = sa.Column(sa.String, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    nickname = sa.Column(sa.String, nullable=False, unique=True)
    email = sa.Column(sa.String, nullable=False, unique=True)
    age = sa.Column(sa.Integer)
    sex = sa.Column(sa.Integer)  # 0=male, 1=female, 2=other
    created_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    updated_at = sa.Column(sa.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)