import json
import psycopg2
import asyncio, asyncpg
from sqlalchemy import text
from app.db import AsyncSessionLocal, DATABASE_URL, get_db
from openai import OpenAI
from app.embedding.services import ProfileEmbeddingService # 임베딩 함수 사용

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

class ChatBotService:
    def __init__(self):
        self.embedding_service = ProfileEmbeddingService()

    # 유저 질문에 대한 키워드 추출
    def extract_intent_keyword(self, query):
        prompt = f"""
         아래는 멘토 매칭을 위한 유저 질문입니다.

    1. 질문의 주요 의도와 목적을 한 문장으로 요약하세요.
    2. 질문에서 다루는 구체적인 주제(subtopic)를 추출하세요.
    3. 멘토 매칭에 도움이 될 만한 핵심 키워드(3~7개)를 리스트로 추출하세요.
    4. 유저가 선호하는 멘토의 성향이나 스타일(예: 친절한, 엄격한, 경험 많은 등)이 드러난다면 요약하세요. 없다면 ""로 남기세요.
    5. 질문의 분위기나 톤(예: 고민, 도전, 불안, 궁금 등)을 한 단어로 표현하세요.

    아래 JSON 형식으로 답변하세요:
    {{
        "intent": "",
        "subtopic": "",
        "keywords": [],
        "tone": "",
        "persona_pref": ""
    }}

    유저 질문: {query}
    """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        text = response.choices[0].message.content

        return json.loads(text)

    # 유저 질문 키워드 임베딩
    async def question_embedding(self, keywords):
        embeddings = []
        for k in keywords:
            resp = await self.embedding_service.embed_text(k)
            embeddings.append(resp)  # 결과를 리스트에 추가
        dim = len(embeddings[0])
        mean_vec = [sum(v[i] for v in embeddings) / len(embeddings) for i in range(dim)]
        return mean_vec
    
    # 관련도 높은 키워드 계산 및 반환
    async def get_top_users(self, query_vec, top_k=3):
        sql = f"""
            SELECT profile_id, embedding <#> '{query_vec}'::vector AS similarity
            FROM profile_chunks
            ORDER BY similarity DESC
            LIMIT {top_k};
        """
        async for session in get_db():
            result = await session.execute(text(sql))
            rows = result.fetchall()
            profile_ids = [row.profile_id for row in rows]

            # profile_id로 user 정보 직접 SQL로 조회
            if not profile_ids:
                return []

            # 여러 profile_id를 한 번에 조회
            profile_ids_str = ",".join(f"'{pid}'" for pid in profile_ids)
            user_sql = f"""
                SELECT u.id, u.name, u.nickname, u.email, u.age, u.sex
                FROM profile p
                JOIN "user" u ON p.user_id = u.id
                WHERE p.id IN ({profile_ids_str});
            """
            user_result = await session.execute(text(user_sql))
            users = user_result.fetchall()
            return users

    def chunks_to_dict(chunks):
        result = {}

        for chunk in chunks:
            # 형태: "[키]\n내용"
            if chunk.startswith("[") and "]" in chunk:
                key = chunk[1:chunk.index("]")]
                value = chunk[chunk.index("]") + 1:].strip()
                result[key] = value

        return result

    # LLM 응답 생성
    def generate_answer_from_users(users, user_question):
        # user 정보를 활용해 답변 생성
        user_infos = [
            f"이름: {u.name}, 닉네임: {u.nickname}, 이메일: {u.email}, 나이: {u.age}, 성별: {u.sex}"
            for u in users
        ]
        prompt = f"""
        유저 질문: {user_question}

        관련 멘토 정보:
        {user_infos}

        역할: 당신은 점잖은 선배 멘토입니다.
        위 멘토 정보를 참고해 공감 기반 답변을 생성하세요.
        (이전 프롬프트 규칙 동일)
        """
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

    async def run_pipeline(self, user_question: str, db):
        """
        전체 파이프라인 실행:
        1) 키워드 추출
        2) 임베딩 생성
        3) 관련 chunk 검색
        4) chunk dict 변환
        5) 답변 생성
        """

        # 1) 유저 질문에서 intent/keywords 추출
        intent_data = self.extract_intent_keyword(user_question)
        keywords = intent_data.get("keywords", [])

        if not keywords:
            return "키워드를 추출할 수 없습니다. 질문을 더 구체적으로 작성해 주세요."

        # 2) 키워드 임베딩 생성
        query_vec = await self.question_embedding(keywords)
        users = await self.get_top_users(query_vec)
        if not users:
            return "관련 멘토를 찾지 못했습니다. 질문을 조금 더 자세히 알려주시면 도와드릴게요!"
        return [u for u in users]