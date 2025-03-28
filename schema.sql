-- Enable pgvector extension
 CREATE EXTENSION IF NOT EXISTS vector;
 ALTER EXTENSION vector SET SCHEMA public;