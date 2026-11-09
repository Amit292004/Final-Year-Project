import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/subscription', requireAuth, async (req, res) => {
  res.json({
    success: true,
    subscription: {
      plan_tier: 'full_access',
      status: 'active',
      license: 'Academic & Portfolio Edition',
      message: 'Full unrestricted candidate intelligence access. All 7 career modules are enabled with zero paywalls.',
      limits: {
        resumes_per_month: 'unlimited',
        assessments_per_month: 'unlimited',
        ai_rewrites_unlimited: true,
        mock_interviews_per_month: 'unlimited'
      }
    }
  });
});

export default router;
