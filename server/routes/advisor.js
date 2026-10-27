import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { aiClient } from '../services/aiClient.js';
import { localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/conversations', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const convos = Array.from(localStore.conversations.values())
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    res.json({ success: true, conversations: convos });
  } catch (err) {
    next(err);
  }
});

router.post('/conversations', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, contextType } = req.body;

    const convoId = uuidv4();
    const convoRecord = {
      id: convoId,
      user_id: userId,
      title: title || 'New Career Advice Session',
      context_type: contextType || 'general',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStore.conversations.set(convoId, convoRecord);

    // Initial greeting from Career Advisor
    const greetingMsg = {
      id: uuidv4(),
      conversation_id: convoId,
      user_id: userId,
      sender: 'assistant',
      content: "Hello! I am your CareerFit AI Strategic Advisor. How can I help sharpen your resume, prepare you for upcoming interviews, or prioritize your next technical skills today?",
      sources: [],
      created_at: new Date().toISOString()
    };
    localStore.conversationMessages.set(greetingMsg.id, greetingMsg);

    res.status(201).json({ success: true, conversation: convoRecord, initialMessage: greetingMsg });
  } catch (err) {
    next(err);
  }
});

router.get('/conversations/:conversationId', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const convo = localStore.conversations.get(conversationId);
    if (!convo || convo.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Conversation not found.' } });
    }

    const messages = Array.from(localStore.conversationMessages.values())
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json({ success: true, conversation: convo, messages });
  } catch (err) {
    next(err);
  }
});

router.post('/conversations/:conversationId/messages', requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) return res.status(400).json({ success: false, error: { message: 'Message content required.' } });

    // Save user message
    const userMsgId = uuidv4();
    const userMsg = {
      id: userMsgId,
      conversation_id: conversationId,
      user_id: userId,
      sender: 'user',
      content: message,
      sources: [],
      created_at: new Date().toISOString()
    };
    localStore.conversationMessages.set(userMsgId, userMsg);

    // Retrieve user context chunks (profile, latest resume, roadmap)
    const profile = localStore.profiles.get(userId) || {};
    const resumes = Array.from(localStore.resumes.values()).filter(r => r.user_id === userId);
    const contextChunks = [];
    if (resumes.length > 0 && resumes[0].parsed_data?.raw_text) {
      contextChunks.push({
        content: resumes[0].parsed_data.raw_text.substring(0, 1500),
        source_type: 'resume'
      });
    }

    // Call AI Advisor
    const aiResponse = await aiClient.advisorChat({
      message,
      targetRole: profile.target_role || 'Software Engineer',
      skills: profile.skills || ['Python', 'JavaScript'],
      contextChunks
    });

    const botMsgId = uuidv4();
    const botMsg = {
      id: botMsgId,
      conversation_id: conversationId,
      user_id: userId,
      sender: 'assistant',
      content: aiResponse.reply,
      sources: aiResponse.sources || [],
      created_at: new Date().toISOString()
    };
    localStore.conversationMessages.set(botMsgId, botMsg);

    // Update conversation timestamp
    const convo = localStore.conversations.get(conversationId);
    if (convo) {
      convo.updated_at = new Date().toISOString();
      localStore.conversations.set(conversationId, convo);
    }

    res.status(201).json({
      success: true,
      message: botMsg
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/conversations/:conversationId', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    localStore.conversations.delete(conversationId);
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
