import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/overview', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Resumes & assessments
    const assessments = Array.from(localStore.assessments.values()).filter(a => a.user_id === userId);
    const avgScore = assessments.length > 0
      ? Math.round(assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length)
      : 78;

    // Matches
    const matches = Array.from(localStore.matches.values()).filter(m => m.user_id === userId);
    const bestMatch = matches.length > 0
      ? Math.max(...matches.map(m => m.overall_score))
      : 84;

    // Skills
    const gaps = Array.from(localStore.gaps.values()).filter(g => g.user_id === userId);
    const missingCount = gaps.filter(g => g.status === 'missing').length;

    // Interviews
    const interviews = Array.from(localStore.interviews.values()).filter(i => i.user_id === userId);
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;

    // Applications by stage
    const applications = Array.from(localStore.applications.values()).filter(a => a.user_id === userId);
    const pipelineStages = {
      wishlist: applications.filter(a => a.stage === 'wishlist').length,
      preparing: applications.filter(a => a.stage === 'preparing').length,
      applied: applications.filter(a => a.stage === 'applied').length,
      assessment: applications.filter(a => a.stage === 'assessment').length,
      interview: applications.filter(a => a.stage === 'interview').length,
      offer: applications.filter(a => a.stage === 'offer').length,
      rejected: applications.filter(a => a.stage === 'rejected').length
    };

    // Score progression history (mocked initial curve if few records)
    const scoreHistory = assessments.length >= 2
      ? assessments.map((a, i) => ({
          assessment: `Version ${i + 1}`,
          score: a.overall_score,
          date: a.created_at.split('T')[0]
        }))
      : [
          { assessment: 'Draft 1', score: 62, date: '2026-10-01' },
          { assessment: 'Draft 2', score: 71, date: '2026-10-12' },
          { assessment: 'Current', score: avgScore, date: '2026-10-27' }
        ];

    res.json({
      success: true,
      metrics: {
        resume_readiness: avgScore,
        best_job_match: bestMatch,
        skills_to_improve: missingCount || 4,
        interviews_completed: completedInterviews || 2,
        pipeline_total: applications.length
      },
      score_history: scoreHistory,
      pipeline_stages: pipelineStages
    });
  } catch (err) {
    next(err);
  }
});

export default router;
