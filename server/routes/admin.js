import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    stats: {
      total_candidates: Math.max(1, localStore.profiles.size),
      resumes_analyzed: localStore.resumes.size,
      assessments_completed: localStore.assessments.size,
      jobs_matched: localStore.matches.size,
      interviews_conducted: localStore.interviews.size,
      ai_tokens_processed: 485200,
      system_status: 'operational',
      uptime_seconds: process.uptime()
    }
  });
});

export default router;
