-- 001_profiles.sql
-- Candidate Profiles and Career Preferences

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  target_role TEXT DEFAULT 'Software Engineer',
  career_status TEXT DEFAULT 'entry_level', -- student, entry_level, mid_level, senior, switcher
  location TEXT,
  work_preferences JSONB DEFAULT '{"remote": true, "hybrid": true, "relocation": false}'::jsonb,
  skills TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  study_hours_per_week INT DEFAULT 10,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'candidate', -- candidate, admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_target_role ON public.profiles(target_role);
