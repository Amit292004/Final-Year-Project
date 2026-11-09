import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { aiClient } from '../services/aiClient.js';
import { supabaseAdmin, localStore } from '../services/supabase.js';

const router = express.Router();

router.post('/jobs', requireAuth, async (req, res, next) => {
  try {
    const { title, company, location, description, sourceUrl } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: { message: 'Title and job description text are required.' } });
    }

    const jobId = uuidv4();
    const jobRecord = {
      id: jobId,
      user_id: userId,
      title,
      company: company || 'Company',
      location: location || 'Remote',
      raw_text: description,
      source_url: sourceUrl || null,
      created_at: new Date().toISOString()
    };

    if (supabaseAdmin) {
      await supabaseAdmin.from('job_descriptions').insert(jobRecord);
    }
    localStore.jobs.set(jobId, jobRecord);

    res.status(201).json({ success: true, job: jobRecord });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobs = Array.from(localStore.jobs.values())
      .filter(j => j.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
});

router.post('/matches', requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const { resumeId, resumeText, jobDescription, jobTitle, company, jobId } = req.body;
    const userId = req.user.id;

    let textToMatch = resumeText;
    let parsedResume = null;

    if (resumeId) {
      const r = localStore.resumes.get(resumeId);
      if (r) {
        textToMatch = r.parsed_data?.raw_text || textToMatch;
        parsedResume = r.parsed_data;
      }
    }

    if (!textToMatch || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: { message: 'Both resume text and job description are required for matching.' }
      });
    }

    const matchResult = await aiClient.matchJob({
      resumeText: textToMatch,
      jobDescription,
      parsedResume,
      jobTitle: jobTitle || 'Target Role',
      company
    });

    const matchId = uuidv4();
    const matchRecord = {
      id: matchId,
      user_id: userId,
      resume_id: resumeId || null,
      job_id: jobId || null,
      job_title: jobTitle || 'Target Role',
      company: company || 'Company',
      overall_score: matchResult.overall_score,
      required_skill_coverage: matchResult.required_skill_coverage,
      preferred_skill_coverage: matchResult.preferred_skill_coverage,
      semantic_similarity: matchResult.semantic_similarity,
      experience_alignment: matchResult.experience_alignment,
      matched_skills: matchResult.matched_skills,
      partial_matches: matchResult.partial_matches,
      missing_skills: matchResult.missing_skills,
      matched_keywords: matchResult.matched_keywords || [],
      missing_keywords: matchResult.missing_keywords || [],
      skills_gap: matchResult.skills_gap || [],
      supporting_passages: matchResult.supporting_passages,
      recommendations: matchResult.recommendations,
      created_at: new Date().toISOString()
    };

    if (supabaseAdmin) {
      await supabaseAdmin.from('job_matches').insert(matchRecord);
    }
    localStore.matches.set(matchId, matchRecord);

    res.status(201).json({
      success: true,
      match: matchRecord
    });
  } catch (err) {
    next(err);
  }
});

router.get('/matches', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const matches = Array.from(localStore.matches.values())
      .filter(m => m.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, matches });
  } catch (err) {
    next(err);
  }
});

router.get('/matches/:matchId', requireAuth, async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = localStore.matches.get(matchId);
    if (!match || match.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Job match report not found.' } });
    }

    res.json({ success: true, match });
  } catch (err) {
    next(err);
  }
});

export default router;
