import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin, localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        return res.json({ success: true, profile: data });
      }
    }

    // LocalStore fallback
    let profile = localStore.profiles.get(userId);
    if (!profile) {
      profile = {
        id: userId,
        email: req.user.email || 'candidate@careerfit.ai',
        full_name: req.user.user_metadata?.full_name || 'Career Candidate',
        target_role: 'Software Engineer',
        career_status: 'entry_level',
        location: 'Remote',
        work_preferences: { remote: true, hybrid: true, relocation: false },
        skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git'],
        goals: ['Land a junior full-stack developer role within 3 months'],
        study_hours_per_week: 12,
        onboarding_completed: true,
        role: req.user.role || 'candidate',
        created_at: new Date().toISOString()
      };
      localStore.profiles.set(userId, profile);
    }

    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    delete updates.id;
    delete updates.role; // Prevent privilege escalation

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        return res.json({ success: true, profile: data });
      }
    }

    let profile = localStore.profiles.get(userId) || { id: userId };
    profile = { ...profile, ...updates, updated_at: new Date().toISOString() };
    localStore.profiles.set(userId, profile);

    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (supabaseAdmin) {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } else {
      localStore.profiles.delete(userId);
    }

    res.json({ success: true, message: 'Account and associated records deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

router.post('/export', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = localStore.profiles.get(userId) || { id: userId, email: req.user.email };
    const resumes = Array.from(localStore.resumes.values()).filter(r => r.user_id === userId);
    const assessments = Array.from(localStore.assessments.values()).filter(a => a.user_id === userId);

    res.json({
      success: true,
      export_date: new Date().toISOString(),
      user_id: userId,
      data: {
        profile,
        resumes,
        assessments
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
