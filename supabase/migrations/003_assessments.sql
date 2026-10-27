-- 003_assessments.sql
-- ATS Resume Readiness Assessments

CREATE TABLE IF NOT EXISTS public.resume_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INT NOT NULL, -- 0-100
  readiness_level TEXT NOT NULL, -- Strong Readiness, Improvement Recommended, Significant Improvements Needed
  category_scores JSONB NOT NULL DEFAULT '{}'::jsonb, 
  -- { formatting: { score: 18, max: 20 }, keywords: { score: 21, max: 25 }, content_quality: { score: 16, max: 20 }, skill_depth: { score: 17, max: 20 }, compatibility: { score: 14, max: 15 } }
  strengths JSONB DEFAULT '[]'::jsonb,
  critical_issues JSONB DEFAULT '[]'::jsonb,
  missing_keywords JSONB DEFAULT '[]'::jsonb,
  bullet_point_rewrites JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  privacy_flags JSONB DEFAULT '[]'::jsonb,
  scoring_version TEXT DEFAULT '1.0.0',
  pdf_report_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_resume_id ON public.resume_assessments(resume_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.resume_assessments(user_id);
