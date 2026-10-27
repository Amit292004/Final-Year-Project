-- 008_applications.sql
-- Job Application Tracker

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  salary_range TEXT,
  stage TEXT DEFAULT 'wishlist', -- wishlist, preparing, applied, assessment, interview, offer, rejected, withdrawn
  application_date DATE,
  deadline DATE,
  follow_up_date DATE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  job_match_id UUID REFERENCES public.job_matches(id) ON DELETE SET NULL,
  job_url TEXT,
  contact_person TEXT,
  notes TEXT,
  next_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);
