-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
ALTER EXTENSION vector SET SCHEMA public;

-- Create sample table
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    item_data JSONB,
    embedding vector(1536), -- vector data
    vector_id VARCHAR(255) NOT NULL,
    metadata JSONB
);