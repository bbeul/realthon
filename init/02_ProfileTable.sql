CREATE EXTENSION IF NOT EXISTS vector; -- 임베딩용 벡터 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID 지원

-- Profile 테이블
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    univ TEXT,
    major TEXT,
    grade TEXT,
    gpa TEXT,
    company TEXT,
    job TEXT,
    ref_score FLOAT,
    career_year INT,
    profile_data JSONB,
    profile_tags TEXT[],
    embedding vector(1024),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Profile Chunks 테이블
CREATE TABLE IF NOT EXISTS profile_chunks (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profile(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    chunk_text TEXT,
    embedding vector(1024),
    created_at TIMESTAMP DEFAULT NOW()
);