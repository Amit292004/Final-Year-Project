-- 012_rls_policies.sql
-- Enable Row Level Security (RLS) across all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Helper check for admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users can select/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Resumes & Versions
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume versions" ON public.resume_versions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own resume versions" ON public.resume_versions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own resume versions" ON public.resume_versions FOR DELETE USING (auth.uid() = user_id);

-- Assessments
CREATE POLICY "Users can view own assessments" ON public.resume_assessments FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own assessments" ON public.resume_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own assessments" ON public.resume_assessments FOR DELETE USING (auth.uid() = user_id);

-- Job Descriptions & Matches
CREATE POLICY "Users can view own job descriptions" ON public.job_descriptions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own job descriptions" ON public.job_descriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own job descriptions" ON public.job_descriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own job descriptions" ON public.job_descriptions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own matches" ON public.job_matches FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own matches" ON public.job_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own matches" ON public.job_matches FOR DELETE USING (auth.uid() = user_id);

-- Skills & Roadmaps
CREATE POLICY "Users can manage own skills" ON public.skill_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skill gaps" ON public.skill_gaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own roadmaps" ON public.learning_roadmaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own roadmap tasks" ON public.roadmap_tasks FOR ALL USING (auth.uid() = user_id);

-- Interviews
CREATE POLICY "Users can manage own interview sessions" ON public.interview_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own interview messages" ON public.interview_messages FOR ALL USING (auth.uid() = user_id);

-- Conversations (Advisor)
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own conversation messages" ON public.conversation_messages FOR ALL USING (auth.uid() = user_id);

-- Applications
CREATE POLICY "Users can manage own applications" ON public.applications FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Subscriptions & Usage
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own ai usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);

-- Feedback
CREATE POLICY "Users can insert feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
