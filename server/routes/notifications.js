import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { localStore } from '../services/supabase.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    let notifs = Array.from(localStore.notifications.values()).filter(n => n.user_id === userId);

    if (notifs.length === 0) {
      const defaults = [
        {
          id: uuidv4(),
          user_id: userId,
          title: 'Resume Assessment Ready',
          message: 'Your latest ATS readiness evaluation scored 82/100 with 3 actionable rewrites.',
          type: 'success',
          link: '/resumes',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          title: 'New High Job Match Detected',
          message: 'Acme Cloud Systems matches 88% of your core skills. Review missing keywords before applying.',
          type: 'info',
          link: '/matching',
          is_read: false,
          created_at: new Date(Date.now() - 14400000).toISOString()
        },
        {
          id: uuidv4(),
          user_id: userId,
          title: 'Roadmap Milestone Reminder',
          message: 'Continue your Docker & Containerization practical exercise this week.',
          type: 'reminder',
          link: '/roadmap',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      defaults.forEach(d => localStore.notifications.set(d.id, d));
      notifs = defaults;
    }

    res.json({ success: true, notifications: notifs });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = localStore.notifications.get(id);
    if (notif) {
      notif.is_read = true;
      localStore.notifications.set(id, notif);
    }
    res.json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    for (const [id, notif] of localStore.notifications.entries()) {
      if (notif.user_id === userId) {
        notif.is_read = true;
        localStore.notifications.set(id, notif);
      }
    }
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

export default router;
