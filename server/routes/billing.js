import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/subscription', requireAuth, async (req, res) => {
  res.json({
    success: true,
    subscription: {
      plan_tier: 'pro_preview',
      status: 'active',
      billing_gateway: 'unconfigured',
      message: 'Payment gateway integration is currently unconfigured. All SaaS candidate intelligence features are fully unlocked for academic and testing purposes.',
      limits: {
        resumes_per_month: 25,
        assessments_per_month: 50,
        ai_rewrites_unlimited: true,
        mock_interviews_per_month: 20
      }
    }
  });
});

export default router;
