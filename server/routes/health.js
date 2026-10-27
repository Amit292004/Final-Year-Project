import express from 'express';
import { aiClient } from '../services/aiClient.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  let aiStatus = 'disconnected';
  try {
    const aiHealth = await aiClient.health();
    aiStatus = aiHealth.status;
  } catch (e) {
    aiStatus = 'offline';
  }

  res.json({
    success: true,
    service: 'CareerFit AI Node.js Express Gateway',
    version: '1.0.0',
    gateway_status: 'healthy',
    ai_service_status: aiStatus,
    timestamp: new Date().toISOString()
  });
});

export default router;
