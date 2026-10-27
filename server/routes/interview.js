import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { aiClient } from '../services/aiClient.js';
import { localStore } from '../services/supabase.js';

const router = express.Router();

router.post('/', requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetRole, difficulty, questionCount, resumeId, jobDescription } = req.body;

    let resumeText = null;
    if (resumeId) {
      const r = localStore.resumes.get(resumeId);
      if (r) resumeText = r.parsed_data?.raw_text;
    }

    const questions = await aiClient.generateQuestions({
      targetRole: targetRole || 'Software Engineer',
      difficulty: difficulty || 'intermediate',
      questionCount: questionCount || 5,
      resumeText,
      jobDescription
    });

    const sessionId = uuidv4();
    const sessionRecord = {
      id: sessionId,
      user_id: userId,
      target_role: targetRole || 'Software Engineer',
      difficulty: difficulty || 'intermediate',
      question_count: questions.length,
      status: 'in_progress',
      created_at: new Date().toISOString()
    };
    localStore.interviews.set(sessionId, sessionRecord);

    const savedMessages = [];
    for (const q of questions) {
      const msgId = uuidv4();
      const msgRecord = {
        id: msgId,
        session_id: sessionId,
        user_id: userId,
        question_order: q.order,
        question_text: q.question,
        question_type: q.type,
        difficulty: q.difficulty,
        target_skill: q.target_skill,
        expected_topics: q.expected_topics,
        hint: q.hint,
        user_answer: null,
        evaluation: null,
        created_at: new Date().toISOString()
      };
      localStore.interviewMessages.set(msgId, msgRecord);
      savedMessages.push(msgRecord);
    }

    res.status(201).json({
      success: true,
      session: sessionRecord,
      questions: savedMessages
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessions = Array.from(localStore.interviews.values())
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
});

router.get('/:sessionId', requireAuth, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = localStore.interviews.get(sessionId);
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Session not found.' } });
    }

    const messages = Array.from(localStore.interviewMessages.values())
      .filter(m => m.session_id === sessionId)
      .sort((a, b) => a.question_order - b.question_order);

    res.json({ success: true, session, messages });
  } catch (err) {
    next(err);
  }
});

router.post('/:sessionId/answer', requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { messageId, userAnswer } = req.body;
    const userId = req.user.id;

    const session = localStore.interviews.get(sessionId);
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Session not found.' } });
    }

    const msg = localStore.interviewMessages.get(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, error: { message: 'Question message not found.' } });
    }

    // Call AI Evaluation
    const evaluation = await aiClient.evaluateAnswer({
      question: msg.question_text,
      questionType: msg.question_type,
      difficulty: msg.difficulty,
      userAnswer: userAnswer || '',
      targetRole: session.target_role,
      expectedTopics: msg.expected_topics || []
    });

    msg.user_answer = userAnswer;
    msg.evaluation = evaluation;
    localStore.interviewMessages.set(messageId, msg);

    res.json({
      success: true,
      message: msg,
      evaluation
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:sessionId/complete', requireAuth, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = localStore.interviews.get(sessionId);
    if (!session) return res.status(404).json({ success: false, error: { message: 'Session not found.' } });

    const messages = Array.from(localStore.interviewMessages.values())
      .filter(m => m.session_id === sessionId && m.evaluation);

    let avgTech = 0;
    let avgClarity = 0;
    if (messages.length > 0) {
      const sumTech = messages.reduce((acc, m) => acc + (m.evaluation.technical_depth || 5), 0);
      const sumClar = messages.reduce((acc, m) => acc + (m.evaluation.communication_clarity || 5), 0);
      avgTech = round(sumTech / messages.length, 1);
      avgClarity = round(sumClar / messages.length, 1);
    }

    session.status = 'completed';
    session.technical_depth_score = avgTech;
    session.communication_score = avgClarity;
    session.overall_score = Math.round((avgTech + avgClarity) * 5); // 0-100
    session.completed_at = new Date().toISOString();
    localStore.interviews.set(sessionId, session);

    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
});

function round(val, dec) {
  return Number(Math.round(val + 'e' + dec) + 'e-' + dec);
}

export default router;
