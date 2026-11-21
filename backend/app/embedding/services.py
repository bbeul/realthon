import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Optional
from app.db import AsyncSessionLocal
from sqlalchemy import text
from datetime import datetime
from fastapi import HTTPException
from sentence_transformers import SentenceTransformer
from kiwipiepy import Kiwi
import json
from zoneinfo import ZoneInfo
from app.embedding.models import ProfileRead, UserRead

class ProfileEmbeddingService:
    _model: Optional[SentenceTransformer] = None
    _model_lock = threading.Lock()
    _executor = ThreadPoolExecutor(max_workers=4)
    _encode_lock = threading.Lock()

    def __init__(self):
        self.kiwi = Kiwi()
        self.model = self._get_model()

    # -----------------------------
    # Lazy model loader (thread-safe)
    # -----------------------------
    def _get_model(self):
        with self._model_lock:
            if self._model is None:
                self._model = SentenceTransformer("dragonkue/multilingual-e5-small-ko")
            return self._model

    # -----------------------------
    # Sentence Split
    # -----------------------------
    def split_sentences(self, text: str) -> List[str]:
        return [s.text.strip() for s in self.kiwi.split_into_sents(text) if s.text.strip()]

    # -----------------------------
    # Chunk Builder
    # -----------------------------
    def build_chunks(self, sentences: List[str], min_size=200, max_size=1500) -> List[str]:
        chunks = []
        current = ""

        for s in sentences:
            if len(current) + len(s) <= max_size:
                current += " " + s
            else:
                if current.strip():
                    chunks.append(current.strip())
                current = s

        if current.strip():
            chunks.append(current.strip())

        # merge short chunks
        merged = []
        for c in chunks:
            if merged and len(c) < min_size:
                merged[-1] = (merged[-1] + " " + c).strip()
            else:
                merged.append(c)

        return merged

    # -----------------------------
    # Chunk Text
    # -----------------------------
    def chunk_text(self, text: str) -> List[str]:
        if not text or not text.strip():
            return []

        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        results = []

        for p in paragraphs:
            if len(p) > 1500:
                sents = self.split_sentences(p)
                results.extend(self.build_chunks(sents))
            else:
                results.append(p)

        return results

    # -----------------------------
    # Async Embedding
    # -----------------------------
    async def embed_text(self, text: str) -> List[float]:
        loop = asyncio.get_event_loop()

        def encode_with_lock():
            with self._encode_lock:
                return self.model.encode(text, convert_to_numpy=True)

        emb = await loop.run_in_executor(
            self._executor,
            encode_with_lock
        )

        return emb.tolist()

    # -----------------------------
    # Main Pipeline: chunk + embed
    # -----------------------------
    async def process_profile(self, profile):
        profile_data_str = "\n\n".join(
            f"[{k}]\n{v}" for k, v in (profile.profile_data or {}).items()
        )

        chunks = self.chunk_text(profile_data_str)

        embeddings = await asyncio.gather(
            *(self.embed_text(chunk) for chunk in chunks)
        )

        return list(zip(chunks, embeddings))


    async def save_profile(self, profile):
        async with AsyncSessionLocal() as session:
            try:
                await session.execute(
                    text("""
                        INSERT INTO profile (
                            id, user_id, univ, major, grade, gpa, company, job,
                            ref_score, career_year, profile_data, profile_tags,
                            created_at, updated_at
                        ) VALUES (
                            :id, :user_id, :univ, :major, :grade, :gpa, :company, :job,
                            :ref_score, :career_year, :profile_data, :profile_tags,
                            :created_at, :updated_at
                        )
                    """),
                    {
                        "id": str(profile.id),
                        "user_id": str(profile.user_id),
                        "univ": profile.univ,
                        "major": profile.major,
                        "grade": profile.grade,
                        "gpa": profile.gpa,
                        "company": profile.company,
                        "job": profile.job,
                        "ref_score": profile.ref_score,
                        "career_year": profile.career_year,
                        "profile_data": json.dumps(profile.profile_data),  # 직렬화
                        "profile_tags": profile.profile_tags,    # 직렬화
                        "created_at": datetime.now(ZoneInfo("Asia/Seoul")).replace(tzinfo=None),
                        "updated_at": datetime.now(ZoneInfo("Asia/Seoul")).replace(tzinfo=None)
                    }
                )
                await session.commit()
            except Exception as e:
                await session.rollback()
                raise HTTPException(status_code=500, detail=str(e))

    # -----------------------------
    # INSERT chunk + embedding → profile_chunks 테이블
    # -----------------------------
    async def save_profile_chunks(self, profile_id, user_id, chunks_embeddings):
        async with AsyncSessionLocal() as session:
            try:
                for chunk, embedding in chunks_embeddings:
                    # embedding 리스트를 쉼표로 join하여 문자열로 변환
                    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
                    await session.execute(
                        text("""
                            INSERT INTO profile_chunks (
                                profile_id, user_id, chunk_text, embedding, created_at
                            ) VALUES (
                                :profile_id, :user_id, :chunk_text, :embedding, :created_at
                            )
                        """),
                        {
                            "profile_id": str(profile_id),
                            "user_id": str(user_id),
                            "chunk_text": chunk,
                            "embedding": embedding_str,
                            "created_at": datetime.utcnow(),
                        }
                    )

                await session.commit()

            except Exception as e:
                await session.rollback()
                raise HTTPException(status_code=500, detail=str(e))

    # -----------------------------
    # 전체 파이프라인 (API에서 호출)
    # -----------------------------
    async def process_and_save(self, profile):
        # 1) chunk + embedding
        chunks_embeddings = await self.process_profile(profile)

        # 2) 기본 profile 정보 저장
        await self.save_profile(profile)

        # 3) chunk 데이터 저장
        await self.save_profile_chunks(
            profile_id=profile.id,
            user_id=profile.user_id,
            chunks_embeddings=chunks_embeddings
        )

        return {
            "profile_id": profile.id,
            "chunk_count": len(chunks_embeddings)
        }

    async def get_all_profiles(self) -> List[ProfileRead]:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                text("SELECT * FROM profile")
            )
            rows = result.fetchall()
            profiles = []
            for row in rows:
                profile = ProfileRead(
                    id=row.id,
                    user_id=row.user_id,
                    univ=row.univ,
                    major=row.major,
                    grade=row.grade,
                    gpa=row.gpa,
                    company=row.company,
                    job=row.job,
                    ref_score=row.ref_score,
                    career_year=row.career_year,
                    profile_data=row.profile_data or {},
                    profile_tags=row.profile_tags or [],
                    created_at=row.created_at,
                    updated_at=row.updated_at
                )
                profiles.append(profile)
            return profiles


    async def get_profile_by_user_id(self, user_id: str) -> Optional[ProfileRead]:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                text("""SELECT p.*, u.name as user_name, u.nickname as user_nickname,
                       u.email as user_email, u.age as user_age, u.sex as user_sex
                FROM profile p
                JOIN "user" u ON p.user_id = u.id
                WHERE p.user_id = :user_id """),
                {"user_id": user_id}
            )
            row = result.fetchone()
            if not row:
                return None

            profile = ProfileRead(
                id=row.id,
                user=UserRead(id=row.user_id,
                    name=row.user_name,
                    nickname=row.user_nickname,
                    email=row.user_email,
                    age=row.user_age,
                    sex=row.user_sex
                ),
                univ=row.univ,
                major=row.major,
                grade=row.grade,
                gpa=row.gpa,
                company=row.company,
                job=row.job,
                ref_score=row.ref_score,
                career_year=row.career_year,
                profile_data=row.profile_data or {},
                profile_tags=row.profile_tags or [],
                created_at=row.created_at,
                updated_at=row.updated_at
            )
            return profile