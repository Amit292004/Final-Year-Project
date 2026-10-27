-- 004_job_matching.sql
-- Job Descriptions and Semantic Matching

CREATE TABLE IF NOT EXISTS public.job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  raw_text TEXT NOT NULL,
  source_url TEXT,
  parsed_data JSONB DEFAULT '{}'::jsonb, -- required_skills, preferred_skills, experience_reqs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.job_descriptions(id) ON DELETE CASCADE,
  overall_score INT NOT NULL, -- 0-100
  required_skill_coverage NUMERIC(5,2) DEFAULT 0.00,
  preferred_skill_coverage NUMERIC(5,2) DEFAULT 0.00,
  semantic_similarity NUMERIC(5,2) DEFAULT 0.00,
  experience_alignment NUMERIC(5,2) DEFAULT 0.00,
  matched_skills JSONB DEFAULT '[]'::jsonb,
  partial_matches JSONB DEFAULT '[]'::jsonb,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  supporting_passages JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_resume_id ON public.job_matches(resume_id);
