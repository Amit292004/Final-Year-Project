import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin, localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/gaps', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user has an assessment with skill validation details from ATS Scorer
    const userAssessments = Array.from(localStore.assessments.values())
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (userAssessments.length > 0) {
      const latest = userAssessments[0];
      const svd = latest.skill_validation_details || {};
      const validated = svd.validated || [];
      const unvalidated = svd.unvalidated || [];
      const missing = latest.missing_keywords || (latest.jd_comparison?.missing_keywords) || (latest.jd_comparison?.skills_gap) || [];

      const liveGaps = [];

      // 1. Validated Skills with Project Proof
      for (const item of validated) {
        liveGaps.push({
          id: uuidv4(),
          user_id: userId,
          target_role: latest.target_role || 'Software Engineer',
          skill_name: item.skill,
          category: 'technical',
          importance: 'important',
          status: 'verified',
          current_evidence: item.projects?.length > 0 ? `Applied in: ${item.projects.join(', ')}` : 'Demonstrated in experience bullets',
          similarity_score: item.similarity || 1.0,
          recommendation: 'Skill validated by project evidence. Emphasize impact in interview responses.',
          created_at: latest.created_at
        });
      }

      // 2. Unvalidated Skills (Listed on resume, but lack project proof)
      for (const skill of unvalidated) {
        liveGaps.push({
          id: uuidv4(),
          user_id: userId,
          target_role: latest.target_role || 'Software Engineer',
          skill_name: skill,
          category: 'technical',
          importance: 'critical',
          status: 'unvalidated',
          current_evidence: 'Listed in skills section but missing project or work experience evidence',
          recommendation: `Add a project or work bullet demonstrating '${skill}', or remove it from listed skills.`,
          created_at: latest.created_at
        });
      }

      // 3. Missing Skills (From JD / Benchmark Gaps)
      for (const skill of missing) {
        // avoid duplicates
        if (liveGaps.some(g => g.skill_name.toLowerCase() === skill.toLowerCase())) continue;
        liveGaps.push({
          id: uuidv4(),
          user_id: userId,
          target_role: latest.target_role || 'Software Engineer',
          skill_name: skill,
          category: 'technical',
          importance: 'critical',
          status: 'missing',
          current_evidence: `Required for ${latest.target_role || 'Software Engineer'} but absent from resume`,
          recommendation: `Target acquisition through a structured learning project.`,
          created_at: latest.created_at
        });
      }

      if (liveGaps.length > 0) {
        const verifiedCount = liveGaps.filter(g => g.status === 'verified').length;
        const unvalidatedCount = liveGaps.filter(g => g.status === 'unvalidated').length;
        const missingCount = liveGaps.filter(g => g.status === 'missing').length;
        const total = liveGaps.length;
        const valPct = total > 0 ? Math.round((verifiedCount / (verifiedCount + unvalidatedCount || 1)) * 100) : 0;

        return res.json({
          success: true,
          gaps: liveGaps,
          summary: {
            total,
            verified: verifiedCount,
            unvalidated: unvalidatedCount,
            missing: missingCount,
            validation_pct: svd.validation_pct || valPct
          }
        });
      }
    }

    // Default benchmark gaps if no assessment has been run yet
    let gaps = Array.from(localStore.gaps.values()).filter(g => g.user_id === userId);
    if (gaps.length === 0) {
      const defaults = [
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'Python', category: 'technical', importance: 'critical', status: 'verified', current_evidence: 'Demonstrated in backend APIs project', recommendation: 'Emphasize architectural depth in interviews' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'FastAPI', category: 'framework', importance: 'important', status: 'verified', current_evidence: 'Applied in CareerFit AI Platform', recommendation: 'Highlight asynchronous endpoint design' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'Docker', category: 'devops', importance: 'critical', status: 'unvalidated', current_evidence: 'Listed in skills section but missing project evidence', recommendation: 'Add a containerization project demonstrating Docker' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'Kubernetes', category: 'cloud', importance: 'critical', status: 'missing', current_evidence: 'Required by benchmark but not found on resume', recommendation: 'Build cluster orchestration roadmap project' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'PostgreSQL', category: 'database', importance: 'important', status: 'verified', current_evidence: 'Applied in REST APIs with 99.9% uptime', recommendation: 'Discuss indexing and query optimization' },
        { id: uuidv4(), user_id: userId, target_role: 'Software Engineer', skill_name: 'Redis', category: 'database', importance: 'bonus', status: 'missing', current_evidence: 'No caching layer experience cited', recommendation: 'Add caching layer project' }
      ];
      defaults.forEach(d => localStore.gaps.set(d.id, d));
      gaps = defaults;
    }

    res.json({
      success: true,
      gaps,
      summary: {
        total: gaps.length,
        verified: gaps.filter(g => g.status === 'verified').length,
        unvalidated: gaps.filter(g => g.status === 'unvalidated').length,
        missing: gaps.filter(g => g.status === 'missing').length,
        validation_pct: 60
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/gaps/analyze', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetRole, resumeSkills, requiredSkills } = req.body;

    const userSkillsSet = new Set((resumeSkills || []).map(s => s.toLowerCase()));
    const reqSet = requiredSkills || ['Python', 'Docker', 'PostgreSQL', 'System Design', 'Git', 'REST API'];

    const newGaps = [];
    for (const reqSkill of reqSet) {
      const isPresent = userSkillsSet.has(reqSkill.toLowerCase());
      const gapRecord = {
        id: uuidv4(),
        user_id: userId,
        target_role: targetRole || 'Software Engineer',
        skill_name: reqSkill,
        category: 'technical',
        importance: ['Docker', 'PostgreSQL', 'System Design'].includes(reqSkill) ? 'critical' : 'important',
        status: isPresent ? 'verified' : 'missing',
        current_evidence: isPresent ? 'Demonstrated on resume' : 'Not identified in parsed content',
        recommendation: isPresent ? 'Keep verified evidence updated.' : `Bridge ${reqSkill} through a targeted project.`,
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

router.post('/gaps', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skill_name, category, importance, status, target_role, current_evidence, recommendation } = req.body;

    if (!skill_name) {
      return res.status(400).json({ success: false, error: { message: 'Skill name is required.' } });
    }

    const gapRecord = {
      id: uuidv4(),
      user_id: userId,
      target_role: target_role || 'Software Engineer',
      skill_name,
      category: category || 'technical',
      importance: importance || 'important',
      status: status || 'missing',
      current_evidence: current_evidence || 'Custom benchmark tracked skill',
      recommendation: recommendation || `Target proficiency in ${skill_name} through targeted projects.`,
      created_at: new Date().toISOString()
    };

    localStore.gaps.set(gapRecord.id, gapRecord);
    res.status(201).json({ success: true, gap: gapRecord });
  } catch (err) {
    next(err);
  }
});

router.patch('/gaps/:gapId', requireAuth, async (req, res, next) => {
  try {
    const { gapId } = req.params;
    const { status, importance, current_evidence, recommendation } = req.body;
    const gap = localStore.gaps.get(gapId);
    if (!gap) return res.status(404).json({ success: false, error: { message: 'Skill gap record not found.' } });

    if (status !== undefined) gap.status = status;
    if (importance !== undefined) gap.importance = importance;
    if (current_evidence !== undefined) gap.current_evidence = current_evidence;
    if (recommendation !== undefined) gap.recommendation = recommendation;
    gap.updated_at = new Date().toISOString();

    localStore.gaps.set(gapId, gap);

    res.json({ success: true, gap });
  } catch (err) {
    next(err);
  }
});

router.delete('/gaps/:gapId', requireAuth, async (req, res, next) => {
  try {
    const { gapId } = req.params;
    if (!localStore.gaps.has(gapId)) {
      return res.status(404).json({ success: false, error: { message: 'Skill gap record not found.' } });
    }
    localStore.gaps.delete(gapId);
    res.json({ success: true, message: 'Skill gap removed.' });
  } catch (err) {
    next(err);
  }
});

export default router;
