import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Map,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { apiRequest } from '../../lib/apiClient';

export function LearningRoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadRoadmaps = async () => {
    try {
      const data = await apiRequest('/roadmaps');
      const list = data.roadmaps || [];
      setRoadmaps(list);
      if (list.length > 0) setActiveRoadmap(list[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      // Pull missing or unvalidated skills from skill gaps dynamically
      const gapData = await apiRequest('/skills/gaps').catch(() => ({ gaps: [] }));
      const needsProof = (gapData.gaps || [])
        .filter(g => g.status === 'missing' || g.status === 'unvalidated')
        .map(g => g.skill_name);

      const skillsToLearn = needsProof.length > 0 ? needsProof.slice(0, 5) : ['Docker', 'PostgreSQL Optimization', 'System Design Patterns', 'CI/CD Automation'];

      await apiRequest('/roadmaps', {
        method: 'POST',
        body: JSON.stringify({
          targetRole: 'Software Engineer',
          missingSkills: skillsToLearn,
          weeklyHours: 10
        })
      });
      await loadRoadmaps();
      toast.success('Learning roadmap generated successfully!');
    } catch (e) {
      toast.error('Failed to generate roadmap: ' + (e.message || e));
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await apiRequest(`/roadmaps/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });

      // Update in local state
      if (activeRoadmap) {
        const updatedTasks = activeRoadmap.tasks.map(t =>
          t.id === taskId ? { ...t, status: nextStatus } : t
        );
        const comp = updatedTasks.filter(t => t.status === 'completed').length;
        const pct = updatedTasks.length > 0 ? Math.round((comp / updatedTasks.length) * 100) : 0;
        setActiveRoadmap({ ...activeRoadmap, tasks: updatedTasks, progress_percentage: pct });
      }
      toast.success(nextStatus === 'completed' ? 'Milestone completed!' : 'Milestone marked pending');
    } catch (e) {
      toast.error('Failed to update task.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-carbon">
            Personalized Learning Roadmap
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Systematic milestone tasks to bridge critical skill gaps for {activeRoadmap?.target_role || 'Software Engineer'}.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} loading={generating} onClick={handleGenerateRoadmap}>
          Regenerate Roadmap
        </Button>
      </div>

      {!activeRoadmap && !loading ? (
        <Card className="p-12 text-center space-y-4">
          <Map className="w-10 h-10 text-signature mx-auto" />
          <h3 className="font-headline font-bold text-lg text-carbon">No Active Roadmap</h3>
          <p className="text-xs text-textSecondary max-w-sm mx-auto">
            Generate your personalized learning milestones derived from your detected skill gaps.
          </p>
          <Button variant="primary" size="md" onClick={handleGenerateRoadmap}>
            Create Roadmap Now
          </Button>
        </Card>
      ) : activeRoadmap ? (
        <div className="space-y-6">
          {/* Roadmap Overview Banner */}
          <Card className="bg-white border-borderStrong p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderStandard">
              <div>
                <span className="text-[11px] font-bold text-burnt uppercase tracking-wider">
                  Active Career Roadmap
                </span>
                <h2 className="font-headline font-extrabold text-xl text-carbon">
                  {activeRoadmap.title}
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-textSecondary">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-signature" />
                  {activeRoadmap.estimated_weeks} Weeks Estimated
                </span>
                <span>•</span>
                <span>{activeRoadmap.weekly_hours} Hours / Week</span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-textSecondary">Milestone Completion Progress</span>
                <span className="text-carbon">{activeRoadmap.progress_percentage || 0}%</span>
              </div>
              <ProgressBar value={activeRoadmap.progress_percentage || 0} max={100} height="h-2.5" />
            </div>
          </Card>

          {/* Tasks Timeline */}
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wider">
              Milestone Action Tasks
            </h3>

            <div className="space-y-4">
              {activeRoadmap.tasks?.map((task, idx) => {
                const isDone = task.status === 'completed';
                return (
                  <Card
                    key={task.id}
                    padded={false}
                    className={`transition-all relative overflow-hidden p-5 ${
                      isDone ? 'bg-white opacity-80' : 'bg-white shadow-sm'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDone ? 'bg-semanticSuccess' : 'bg-signature'}`} />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className={`mt-1 transition ${isDone ? 'text-semanticSuccess' : 'text-textDisabled hover:text-signature'}`}
                          aria-label={isDone ? 'Mark task incomplete' : 'Mark task complete'}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-headline font-bold text-sm text-carbon">
                              {idx + 1}. {task.title}
                            </span>
                            <Badge variant={task.priority === 'high' ? 'orange' : 'neutral'} size="sm">
                              {task.skill_name}
                            </Badge>
                          </div>

                          <p className="text-xs text-textSecondary">{task.objective}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-2.5 rounded bg-neutralLight/40 border border-borderStandard space-y-1">
                              <span className="font-bold text-[10px] text-textMuted uppercase flex items-center gap-1">
                                <Code2 className="w-3.5 h-3.5" />
                                <span>Practical Project Exercise</span>
                              </span>
                              <p className="text-textSecondary text-[11px]">{task.practical_exercise}</p>
                            </div>

                            <div className="p-2.5 rounded bg-peach/30 border border-orange-100 space-y-1">
                              <span className="font-bold text-[10px] text-burnt uppercase flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Verified Resource</span>
                              </span>
                              <a
                                href={task.learning_resource?.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-burnt hover:underline font-semibold flex items-center gap-1"
                              >
                                <span>{task.learning_resource?.title || 'Documentation Guide'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-semibold text-textMuted block">
                          ~{task.estimated_hours} hrs
                        </span>
                        <Badge variant={isDone ? 'success' : 'neutral'} size="sm" className="mt-1">
                          {isDone ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
