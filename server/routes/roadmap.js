import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { aiClient } from '../services/aiClient.js';
import { supabaseAdmin, localStore } from '../services/supabase.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetRole, missingSkills, weeklyHours } = req.body;

    const generated = await aiClient.generateRoadmap({
      targetRole: targetRole || 'Software Engineer',
      missingSkills: missingSkills || ['Docker', 'PostgreSQL', 'System Design', 'CI/CD'],
      weeklyHours: weeklyHours || 10
    });

    const roadmapId = uuidv4();
    const roadmapRecord = {
      id: roadmapId,
      user_id: userId,
      target_role: generated.target_role,
      title: generated.title,
      estimated_weeks: generated.estimated_weeks,
      weekly_hours: generated.weekly_hours,
      progress_percentage: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStore.roadmaps.set(roadmapId, roadmapRecord);

    const tasks = [];
    for (const t of generated.tasks) {
      const taskId = uuidv4();
      const taskRecord = {
        id: taskId,
        roadmap_id: roadmapId,
        user_id: userId,
        title: t.title,
        objective: t.objective,
        skill_name: t.skill_name,
        priority: t.priority,
        estimated_hours: t.estimated_hours,
        learning_resource: t.learning_resource,
        practical_exercise: t.practical_exercise,
        completion_criteria: t.completion_criteria,
        status: 'pending',
        sort_order: t.sort_order,
        created_at: new Date().toISOString()
      };
      localStore.roadmapTasks.set(taskId, taskRecord);
      tasks.push(taskRecord);
    }

    res.status(201).json({
      success: true,
      roadmap: { ...roadmapRecord, tasks }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roadmaps = Array.from(localStore.roadmaps.values())
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Attach tasks to each roadmap
    const populated = roadmaps.map(r => {
      const tasks = Array.from(localStore.roadmapTasks.values())
        .filter(t => t.roadmap_id === r.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      const completed = tasks.filter(t => t.status === 'completed').length;
      const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      return { ...r, progress_percentage: progress, tasks };
    });

    res.json({ success: true, roadmaps: populated });
  } catch (err) {
    next(err);
  }
});

router.get('/:roadmapId', requireAuth, async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    const roadmap = localStore.roadmaps.get(roadmapId);
    if (!roadmap || roadmap.user_id !== userId) {
      return res.status(404).json({ success: false, error: { message: 'Roadmap not found.' } });
    }

    const tasks = Array.from(localStore.roadmapTasks.values())
      .filter(t => t.roadmap_id === roadmapId)
      .sort((a, b) => a.sort_order - b.sort_order);

    const completed = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    res.json({ success: true, roadmap: { ...roadmap, progress_percentage: progress, tasks } });
  } catch (err) {
    next(err);
  }
});

router.patch('/tasks/:taskId', requireAuth, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const task = localStore.roadmapTasks.get(taskId);
    if (!task) return res.status(404).json({ success: false, error: { message: 'Task not found.' } });

    task.status = status || task.status;
    if (status === 'completed') task.completed_at = new Date().toISOString();
    localStore.roadmapTasks.set(taskId, task);

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

router.post('/tasks/:taskId/complete', requireAuth, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = localStore.roadmapTasks.get(taskId);
    if (!task) return res.status(404).json({ success: false, error: { message: 'Task not found.' } });

    task.status = 'completed';
    task.completed_at = new Date().toISOString();
    localStore.roadmapTasks.set(taskId, task);

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

export default router;
