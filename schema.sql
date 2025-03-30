-- Enable pgvector extension
 CREATE EXTENSION IF NOT EXISTS vector;
 ALTER EXTENSION vector SET SCHEMA public;

 CREATE TABLE api_key (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);