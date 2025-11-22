import json
import psycopg2
import asyncio, asyncpg
from sqlalchemy import text
from app.db import AsyncSessionLocal, DATABASE_URL, get_db
from openai import OpenAI
from app.embedding.services import ProfileEmbeddingService # 임베딩 함수 사용

OPENAI_API_KEY = __import__("os").getenv("OPENAI_API_KEY", "")
client = OpenAI(api_key=OPENAI_API_KEY)

class ChatBotService:
    def __init__(self):
        self.model = self._get_model()

    # 유저 질문에 대한 키워드 추출
    def extract_intent_keyword(query):
        prompt = f"""
        유저 질문에서 핵심 키워드와 의도를 JSON으로 추출하라.
        
        입력: {query}
        
        출력 형식:
        {{
            "intent": "",
            "subtopic": "",
            "keywords": [],
            "tone": "",
            "persona_pref": ""
        }}
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        text = response.choices[0].message.content

        return json.loads(text)

    # 유저 질문 키워드 임베딩
    async def question_embedding(keywords):
        embeddings = []
        for k in keywords:
            resp = await ProfileEmbeddingService.embed_text(k)
            embeddings.append(resp)
        dim = len(embeddings[0])
        mean_vec = [ sum(v[i] for v in embeddings) / len(embeddings) for i in range(dim)]
        return mean_vec
    
    # 관련도 높은 키워드 계산 및 반환
    async def get_top_chunks(query_vec, top_k=10):

        sql = f"""
            SELECT profile_id, chunk_text, embedding <#> '{query_vec}'::vector AS similarity
            FROM profile_chunks
            ORDER BY similarity DESC
            LIMIT 10;
        """

        async for session in get_db():  # async generator는 async for 사용
            result = await session.execute(text(sql))
            rows = result.fetchall()  # tuple 리스트
            profile_ids = [row.profile_id for row in rows]
            chunk_texts = [row.chunk_text for row in rows]
            return profile_ids[:3], chunk_texts

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
    def generate_answer(top_keywords, user_question):
        persona = "점잖은 선배 멘토" # 나중에 persona list 정의
        
        prompt = f"""
        유저 질문: {user_question}

        참고 문서:
        {top_keywords}

        역할: 당신은 '{persona}'입니다.
        '참고 문서'는 당신이 한 활동입니다.
        화자를 위 역할로 설정해 대화형 답변을 생성하세요.
        아래 3가지 내용을 참고해 공감 기반 답변을 생성하세요.

        1) 공감 + 질문 요약
        2) 핵심 조언 1~3개
        3) 바로 할 수 있는 구체 액션 2개 또는
            키워드 관련 1~2개의 후속 질문 제안

        추가 규칙:
        - 적절한 키워드가 없거나 불확실한 경우 “추가 확인 필요”라고 말하거나 구체적인 질문 유도하기
        - 넘버링 등의 구조화 없이 문단 형식으로 이야기할 것
        """

        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content
    

    async def run_pipeline(self, user_question: str):
        """
        전체 파이프라인 실행:
        1) 키워드 추출
        2) 임베딩 생성
        3) 관련 chunk 검색
        4) chunk dict 변환
        5) 답변 생성
        """

        # 1) 유저 질문에서 intent/keywords 추출
        intent_data = ChatBotService.extract_intent_keyword(user_question)
        keywords = intent_data.get("keywords", [])

        if not keywords:
            return "키워드를 추출할 수 없습니다. 질문을 더 구체적으로 작성해 주세요."

        # 2) 키워드 임베딩 생성
        query_vec = await ChatBotService.question_embedding(keywords)

        # 3) 관련 chunk 검색
        ids, chunks = await ChatBotService.get_top_chunks(query_vec)
        if not chunks:
            return "관련 문서를 찾지 못했습니다. 질문을 조금 더 자세히 알려주시면 도와드릴게요!"

        # 4) chunk 정제 (키-값 dict) -> 답변 생성에 쓰는 거
        chunk_dict = ChatBotService.chunks_to_dict(chunks)

        # 5) 답변 생성
        answer = ChatBotService.generate_answer(chunk_dict, user_question)
        
        return ids, answer