CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
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
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS profile_chunks (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profile(id),
    user_id UUID NOT NULL,
    chunk_text TEXT,
    embedding vector(1024),
    created_at TIMESTAMP
);