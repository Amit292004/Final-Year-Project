import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin, localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/gaps', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    let gaps = Array.from(localStore.gaps.values()).filter(g => g.user_id === userId);

    if (gaps.length === 0) {
      // Default benchmark gaps for fresh candidates
      const defaults = [
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'Docker', category: 'devops', importance: 'critical', status: 'missing', current_evidence: 'Not found on resume' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'PostgreSQL', category: 'database', importance: 'critical', status: 'partial', current_evidence: 'Basic SQL mentioned' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'System Design', category: 'architecture', importance: 'important', status: 'missing', current_evidence: 'No distributed architecture cited' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'CI/CD Pipelines', category: 'devops', importance: 'important', status: 'missing', current_evidence: 'Git workflow only' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'Redis', category: 'database', importance: 'bonus', status: 'missing', current_evidence: 'No caching layer experience' }
      ];
      defaults.forEach(d => localStore.gaps.set(d.id, d));
      gaps = defaults;
    }

    res.json({ success: true, gaps });
  } catch (err) {
    next(err);
  }
});

router.post('/gaps/analyze', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetRole, resumeSkills, requiredSkills } = req.body;

    const userSkillsSet = new Set(resumeSkills || []);
    const reqSet = requiredSkills || ['Python', 'Docker', 'PostgreSQL', 'System Design', 'Git', 'REST API'];

    const newGaps = [];
    for (const reqSkill of reqSet) {
      const isPresent = userSkillsSet.has(reqSkill);
      const gapRecord = {
        id: uuidv4(),
        user_id: userId,
        target_role: targetRole || 'Software Engineer',
        skill_name: reqSkill,
        category: 'technical',
        importance: ['Docker', 'PostgreSQL', 'System Design'].includes(reqSkill) ? 'critical' : 'important',
        status: isPresent ? 'verified' : 'missing',
        current_evidence: isPresent ? 'Demonstrated on resume' : 'Not identified in parsed content',
        created_at: new Date().toISOString()
      };
      localStore.gaps.set(gapRecord.id, gapRecord);
      newGaps.push(gapRecord);
    }

    res.json({ success: true, gaps: newGaps });
  } catch (err) {
    next(err);
  }
});

router.patch('/gaps/:gapId', requireAuth, async (req, res, next) => {
  try {
    const { gapId } = req.params;
    const { status } = req.body;
    const gap = localStore.gaps.get(gapId);
    if (!gap) return res.status(404).json({ success: false, error: { message: 'Skill gap record not found.' } });

    gap.status = status || gap.status;
    localStore.gaps.set(gapId, gap);

    res.json({ success: true, gap });
  } catch (err) {
    next(err);
  }
});

export default router;
