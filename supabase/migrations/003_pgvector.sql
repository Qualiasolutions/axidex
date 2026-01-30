-- Axidex pgvector Migration
-- Migration: 003_pgvector.sql
-- Enables vector similarity for signal deduplication

-- Enable pgvector extension (Supabase has this available)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to signals table
ALTER TABLE signals
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS signals_embedding_idx
ON signals USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to find similar signals
CREATE OR REPLACE FUNCTION find_similar_signals(
    query_embedding vector(384),
    similarity_threshold float DEFAULT 0.9,
    max_results int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.title,
        1 - (s.embedding <=> query_embedding) as similarity
    FROM signals s
    WHERE s.embedding IS NOT NULL
      AND 1 - (s.embedding <=> query_embedding) > similarity_threshold
    ORDER BY s.embedding <=> query_embedding
    LIMIT max_results;
END;
$$;
