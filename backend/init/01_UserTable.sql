CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID 생성 지원

CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    password VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    nickname VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    age INT,
    sex INT CHECK (sex IN (0,1,2)),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);