import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    let apps = Array.from(localStore.applications.values())
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (apps.length === 0) {
      // Seed default representative applications for demo experience
      const defaults = [
        {
          id: uuidv4(),
          user_id: userId,
          company: 'Acme Cloud Systems',
          role: 'Junior Full Stack Engineer',
          location: 'Remote',
          salary_range: '$85,000 - $105,000',
          stage: 'applied',
          application_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
          deadline: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          notes: 'Submitted customized resume highlighting React & Node.js microservices experience.',
          next_action: 'Follow up on recruiter screen if no reply by next Monday',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          company: 'Nexus Scale Labs',
          role: 'Backend API Developer',
          location: 'New York / Hybrid',
          salary_range: '$95,000 - $115,000',
          stage: 'interview',
          application_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
          notes: 'Passed screening. Technical interview scheduled on system design and PostgreSQL optimization.',
          next_action: 'Complete mock interview practice session on Redis caching',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          company: 'Horizon AI',
          role: 'Software Engineer - AI Platform',
          location: 'San Francisco / Remote',
          salary_range: '$110,000 - $130,000',
          stage: 'preparing',
          notes: 'Matching score 88%. Need to review FastAPI and vector embeddings before submitting.',
          next_action: 'Fine-tune bullet points using AI rewriter',
          created_at: new Date().toISOString()
        }
      ];
      defaults.forEach(d => localStore.applications.set(d.id, d));
      apps = defaults;
    }

    res.json({ success: true, applications: apps });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { company, role, location, salaryRange, stage, applicationDate, deadline, notes, nextAction } = req.body;

    if (!company || !role) {
      return res.status(400).json({ success: false, error: { message: 'Company and Role are required.' } });
    }

    const appId = uuidv4();
    const appRecord = {
      id: appId,
      user_id: userId,
      company,
      role,
      location: location || 'Remote',
      salary_range: salaryRange || null,
      stage: stage || 'wishlist',
      application_date: applicationDate || new Date().toISOString().split('T')[0],
      deadline: deadline || null,
      notes: notes || '',
      next_action: nextAction || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStore.applications.set(appId, appRecord);
    res.status(201).json({ success: true, application: appRecord });
  } catch (err) {
    next(err);
  }
});

router.patch('/:applicationId', requireAuth, async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    let app = localStore.applications.get(applicationId);
    if (!app || app.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    app = { ...app, ...updates, updated_at: new Date().toISOString() };
    localStore.applications.set(applicationId, app);

    res.json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
});

router.delete('/:applicationId', requireAuth, async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    localStore.applications.delete(applicationId);
    res.json({ success: true, message: 'Application removed.' });
  } catch (err) {
    next(err);
  }
});

export default router;
