-- 005_skills_roadmaps.sql
-- Skill Profiles, Skill Gaps, and Learning Roadmaps

CREATE TABLE IF NOT EXISTS public.skill_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canonical_name TEXT NOT NULL,
  category TEXT DEFAULT 'technical',
  proficiency_level TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
  evidence_status TEXT DEFAULT 'explicit', -- explicit, experience_backed, inferred
  source_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, canonical_name)
);

CREATE TABLE IF NOT EXISTS public.skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  category TEXT DEFAULT 'technical',
  importance TEXT DEFAULT 'critical', -- critical, important, bonus
  status TEXT DEFAULT 'missing', -- missing, partial, verified
  target_proficiency TEXT DEFAULT 'intermediate',
  current_evidence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  title TEXT NOT NULL,
  estimated_weeks INT DEFAULT 8,
  weekly_hours INT DEFAULT 10,
  progress_percentage INT DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, paused, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.learning_roadmaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  priority TEXT DEFAULT 'high', -- high, medium, low
  estimated_hours INT DEFAULT 4,
  learning_resource JSONB DEFAULT '{}'::jsonb, -- { title, url, type }
  practical_exercise TEXT,
  completion_criteria TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  completed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_profiles_user ON public.skill_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user ON public.skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_user ON public.learning_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap ON public.roadmap_tasks(roadmap_id);
