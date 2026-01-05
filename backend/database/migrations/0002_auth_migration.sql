BEGIN;

-- ============================================================================
-- FASE 2: AUTENTISERING OG TEAM - DATABASE MIGRATION
-- ============================================================================
-- This migration adds Supabase Auth support with:
-- - Profiles table for user metadata
-- - UUID references for created_by/decision_by
-- - Row Level Security (RLS) policies
-- - Automatic profile creation trigger
-- ============================================================================

-- 1. Create profiles table (cache user metadata)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 2. Backup existing created_by for rollback
ALTER TABLE ideas ADD COLUMN created_by_old TEXT;
UPDATE ideas SET created_by_old = created_by WHERE created_by IS NOT NULL;

-- 3. Convert created_by/decision_by to UUID
ALTER TABLE ideas DROP COLUMN created_by;
ALTER TABLE ideas DROP COLUMN decision_by;
ALTER TABLE ideas ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE ideas ADD COLUMN decision_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Add indexes
CREATE INDEX idx_ideas_created_by ON ideas(created_by);
CREATE INDEX idx_ideas_decision_by ON ideas(decision_by);

-- 5. Enable RLS on all tables
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS POLICIES FOR IDEAS
-- ============================================================================

-- SELECT: Users can read their own ideas, or legacy ideas (created_by IS NULL)
CREATE POLICY "Users can read own ideas or legacy"
  ON ideas FOR SELECT
  USING (auth.uid() = created_by OR created_by IS NULL);

-- INSERT: Users can only create ideas for themselves
CREATE POLICY "Users can create ideas"
  ON ideas FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- UPDATE: Users can only update their own ideas
CREATE POLICY "Users can update own ideas"
  ON ideas FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- DELETE: Users can only delete their own ideas
CREATE POLICY "Users can delete own ideas"
  ON ideas FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================================================
-- 7. RLS POLICIES FOR CHAT_MESSAGES
-- ============================================================================

-- SELECT: Users can read messages for their own ideas (or legacy ideas)
CREATE POLICY "Users can read messages for own ideas"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = chat_messages.idea_id
      AND (ideas.created_by = auth.uid() OR ideas.created_by IS NULL)
    )
  );

-- INSERT: Users can only create messages for their own ideas
CREATE POLICY "Users can create messages for own ideas"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = chat_messages.idea_id
      AND ideas.created_by = auth.uid()
    )
  );

-- ============================================================================
-- 8. RLS POLICIES FOR EVALUATION_JOBS
-- ============================================================================

-- SELECT: Users can read evaluation jobs for their own ideas (or legacy ideas)
CREATE POLICY "Users can read jobs for own ideas"
  ON evaluation_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = evaluation_jobs.idea_id
      AND (ideas.created_by = auth.uid() OR ideas.created_by IS NULL)
    )
  );

-- ============================================================================
-- 9. RLS POLICIES FOR PROFILES
-- ============================================================================

-- SELECT: All profiles are publicly readable (for displaying user names/avatars)
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

-- UPDATE: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 10. AUTO-CREATE PROFILE TRIGGER
-- ============================================================================
-- This function is called automatically when a new user signs up via Supabase Auth.
-- It creates a profile entry with the user's email and metadata.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
