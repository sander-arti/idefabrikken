-- Idéfabrikken Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Idéer
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'evaluating', 'evaluated', 'go', 'hold', 'reject')),

  -- Dokumenter (Markdown)
  idea_document TEXT,
  market_report TEXT,
  prd TEXT,
  risk_assessment TEXT,
  evaluation_summary TEXT,

  -- Scores (0-10, én desimal)
  score_market DECIMAL(3,1),
  score_buildability DECIMAL(3,1),
  score_business DECIMAL(3,1),
  score_total DECIMAL(3,1),

  -- AI-anbefaling
  recommendation TEXT CHECK (recommendation IN ('go', 'hold', 'reject')),
  recommendation_reason TEXT,

  -- Menneskelig beslutning
  decision TEXT CHECK (decision IN ('go', 'hold', 'reject')),
  decision_reason TEXT,
  decision_at TIMESTAMPTZ,
  decision_by TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Chat-meldinger for struktureringssamtalen
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rask henting av chat-historikk
CREATE INDEX idx_chat_messages_idea_id ON chat_messages(idea_id);

-- Evalueringsjobber for å tracke fremdrift
CREATE TABLE evaluation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Agent-status
  market_strategist_status TEXT DEFAULT 'pending'
    CHECK (market_strategist_status IN ('pending', 'running', 'completed', 'failed')),
  product_architect_status TEXT DEFAULT 'pending'
    CHECK (product_architect_status IN ('pending', 'running', 'completed', 'failed')),
  business_critic_status TEXT DEFAULT 'pending'
    CHECK (business_critic_status IN ('pending', 'running', 'completed', 'failed')),
  notes_synthesizer_status TEXT DEFAULT 'pending'
    CHECK (notes_synthesizer_status IN ('pending', 'running', 'completed', 'failed')),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Feilhåndtering
  error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kun én aktiv jobb per idé
CREATE UNIQUE INDEX idx_evaluation_jobs_idea_id ON evaluation_jobs(idea_id)
  WHERE status IN ('pending', 'running');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
