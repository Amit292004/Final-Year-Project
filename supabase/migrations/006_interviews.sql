-- 006_interviews.sql
-- Mock Interview Sessions and Evaluation

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  interview_mode TEXT DEFAULT 'mixed', -- technical, behavioral, mixed, skill_gap
  difficulty TEXT DEFAULT 'intermediate', -- entry, intermediate, senior
  question_count INT DEFAULT 5,
  overall_score INT, -- 0-100
  technical_depth_score NUMERIC(3,1), -- 0-10
  communication_score NUMERIC(3,1), -- 0-10
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  summary_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.interview_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'technical', -- background, technical, skill_gap, behavioral
  difficulty TEXT DEFAULT 'intermediate',
  user_answer TEXT,
  audio_url TEXT,
  hint_requested BOOLEAN DEFAULT FALSE,
  evaluation JSONB DEFAULT '{}'::jsonb, 
  -- { technical_depth: 8, communication_clarity: 7, relevance: 9, structure: 8, star_alignment: { situation: true, task: true, action: true, result: false }, feedback: "...", suggestions: [...] }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_messages_session ON public.interview_messages(session_id);
