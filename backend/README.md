# realthon-backend

## 프로젝트 개요
- FastAPI 기반의 백엔드 서버
- PostgreSQL(Supabase) 및 pgvector 연동
- 라우팅 구조 분리(app/ 디렉토리)

---

## 시작 방법

### 1. 환경설정
1. Python 3.10 이상 설치
2. 저장소 클론 및 디렉토리 이동
3. 가상환경 생성 및 활성화
    ```bash
    python -m venv venv
    source venv/bin/activate  # (Windows: venv\Scripts\activate)
    ```
4. 패키지 설치
    ```bash
    pip install -r requirements.txt
    ```
5. .env 파일 생성 (예시)
    ```env
    DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>/<database>
    ```

### 2. 서버 실행
```bash
uvicorn main:app --reload
```
- 기본 주소: http://localhost:8000
- 예시 라우트: GET /

### 3. 주요 구조
- `main.py` : FastAPI 앱 실행 및 라우터 등록
- `app/db.py` : DB 연결 및 세션 관리
- `app/root.py` : 예시 라우트
- `app/` : 라우팅별 파일 분리

---

## 기타
- Supabase, pgvector 등 외부 서비스 연동 필요시 공식 문서 참고
- 추가 라우트 및 기능은 app/ 디렉토리에 파일로 분리하여 관리

