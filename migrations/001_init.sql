-- ============================================================================
-- SENSE Savings Engine - Database Schema (Production Ready)
-- ============================================================================
-- Execute this in Supabase SQL Editor to create all tables

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Price History Table
CREATE TABLE IF NOT EXISTS price_history (
  id BIGSERIAL PRIMARY KEY,
  product_sku VARCHAR(255) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_sku, platform, recorded_at)
);

CREATE INDEX idx_price_history_sku ON price_history(product_sku);
CREATE INDEX idx_price_history_platform ON price_history(platform);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at DESC);

-- 2. Price Watches Table
CREATE TABLE IF NOT EXISTS price_watches (
  id BIGSERIAL PRIMARY KEY,
  product_url TEXT NOT NULL UNIQUE,
  product_name VARCHAR(500) NOT NULL,
  target_price INTEGER NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP WITH TIME ZONE,
  current_price INTEGER
);

CREATE INDEX idx_price_watches_email ON price_watches(user_email);
CREATE INDEX idx_price_watches_notified ON price_watches(notified);
CREATE INDEX idx_price_watches_url ON price_watches(product_url);

-- 3. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  platform VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  discount_percent INTEGER,
  discount_flat INTEGER,
  min_amount INTEGER,
  category VARCHAR(100),
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  ai_tags TEXT[],
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, code, expires_at)
);

CREATE INDEX idx_coupons_platform ON coupons(platform);
CREATE INDEX idx_coupons_category ON coupons(category);
CREATE INDEX idx_coupons_expires_at ON coupons(expires_at DESC);

-- 4. Product Embeddings Table
CREATE TABLE IF NOT EXISTS product_embeddings (
  id BIGSERIAL PRIMARY KEY,
  product_sku VARCHAR(255) NOT NULL UNIQUE,
  product_name VARCHAR(500),
  embedding VECTOR(768),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_embeddings_sku ON product_embeddings(product_sku);
CREATE INDEX idx_product_embeddings_embedding ON product_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 5. Bank Offers Table
CREATE TABLE IF NOT EXISTS bank_offers (
  id BIGSERIAL PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  offer_name VARCHAR(255) NOT NULL,
  discount_percent INTEGER,
  discount_flat INTEGER,
  min_amount INTEGER,
  applicable_platforms TEXT[] NOT NULL,
  applicable_categories TEXT[],
  validity_start TIMESTAMP WITH TIME ZONE,
  validity_end TIMESTAMP WITH TIME ZONE,
  description TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Sessions Table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_email ON auth_sessions(email);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token);

-- ============================================================================
-- RPC Functions (Strictly Defined)
-- ============================================================================

-- match_products: Vector similarity search for products
CREATE OR REPLACE FUNCTION match_products (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  product_sku VARCHAR(255),
  product_name VARCHAR(500),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.product_sku,
    pe.product_name,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM product_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
