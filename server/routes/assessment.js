import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { aiClient } from '../services/aiClient.js';
import { supabaseAdmin, localStore } from '../services/supabase.js';

const router = express.Router();

router.post('/', requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const { resumeId, resumeText, targetRole, jobDescription } = req.body;
    const userId = req.user.id;

    let textToScore = resumeText;
    let parsedData = null;

    if (resumeId) {
      const resume = localStore.resumes.get(resumeId);
      if (resume) {
        textToScore = resume.parsed_data?.raw_text || textToScore;
        parsedData = resume.parsed_data;
      }
    }

    if (!textToScore) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing resume text or valid resumeId to assess.' }
      });
    }

    // Call FastAPI Scorer
    const assessmentResult = await aiClient.scoreResume({
      resumeText: textToScore,
      parsedData,
      targetRole: targetRole || 'Software Engineer',
      jobDescription
    });

    const assessmentId = uuidv4();
    const assessmentRecord = {
      id: assessmentId,
      resume_id: resumeId || null,
      user_id: userId,
      overall_score: assessmentResult.overall_score,
      readiness_level: assessmentResult.readiness_level,
      category_scores: assessmentResult.category_scores,
      strengths: assessmentResult.strengths,
      critical_issues: assessmentResult.critical_issues,
      missing_keywords: assessmentResult.missing_keywords,
      bullet_point_rewrites: assessmentResult.bullet_point_rewrites,
      recommendations: assessmentResult.recommendations,
      privacy_flags: assessmentResult.privacy_flags,
      scoring_version: assessmentResult.scoring_version,
      target_role: targetRole || 'Software Engineer',
      created_at: new Date().toISOString()
    };

    if (supabaseAdmin) {
      await supabaseAdmin.from('resume_assessments').insert(assessmentRecord);
    }
    localStore.assessments.set(assessmentId, assessmentRecord);

    res.status(201).json({
      success: true,
      assessment: assessmentRecord
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:assessmentId', requireAuth, async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.id;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('resume_assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return res.json({ success: true, assessment: data });
      }
    }

    const assessment = localStore.assessments.get(assessmentId);
    if (!assessment || assessment.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Assessment report not found.' } });
    }

    res.json({ success: true, assessment });
  } catch (err) {
    next(err);
  }
});

router.get('/resume/:resumeId', requireAuth, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    const list = Array.from(localStore.assessments.values())
      .filter(a => a.resume_id === resumeId && a.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, assessments: list });
  } catch (err) {
    next(err);
  }
});

router.post('/:assessmentId/report', requireAuth, async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const assessment = localStore.assessments.get(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, error: { message: 'Assessment not found.' } });
    }

    const html = await aiClient.generateReportHtml({
      assessmentData: assessment,
      candidateName: req.user.user_metadata?.full_name || 'Candidate',
      targetRole: assessment.target_role || 'Software Engineer'
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;
