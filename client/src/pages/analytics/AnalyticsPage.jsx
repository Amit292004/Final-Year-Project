import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MetricCard } from '../../components/ui/MetricCard';
import { apiRequest } from '../../lib/apiClient';

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/analytics/overview')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metrics = data?.metrics || {
    resume_readiness: 82,
    best_job_match: 88,
    skills_to_improve: 4,
    interviews_completed: 3,
    pipeline_total: 6
  };

  const scoreHistory = data?.score_history || [
    { assessment: 'Draft 1', score: 62 },
    { assessment: 'Draft 2', score: 71 },
    { assessment: 'Current', score: 82 }
  ];

  const pipelineData = data?.pipeline_stages
    ? Object.entries(data.pipeline_stages).map(([stage, count]) => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count
      }))
    : [
        { stage: 'Wishlist', count: 2 },
        { stage: 'Preparing', count: 1 },
        { stage: 'Applied', count: 3 },
        { stage: 'Interview', count: 1 },
        { stage: 'Offer', count: 0 }
      ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-borderStandard">
        <h1 className="font-headline font-extrabold text-2xl text-carbon">
          Career Analytics & Progress
        </h1>
        <p className="text-xs text-textSecondary mt-0.5">
          Quantifiable progress tracking across ATS score revisions, skill acquisitions, and application conversions.
        </p>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current ATS Readiness"
          value={`${metrics.resume_readiness} / 100`}
          subtext="Strong Readiness rating"
          trend={+14}
          icon={BarChart3}
        />
        <MetricCard
          title="Best Semantic Match"
          value={`${metrics.best_job_match}%`}
          subtext="High required skill overlap"
          icon={TrendingUp}
        />
        <MetricCard
          title="Skill Gaps Remaining"
          value={metrics.skills_to_improve}
          subtext="Active roadmap tasks"
          icon={Target}
        />
        <MetricCard
          title="Pipeline Total"
          value={metrics.pipeline_total}
          subtext="Tracked job opportunities"
          icon={Award}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ATS Score Revision History (AreaChart) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wider">
                ATS Score Progression
              </h3>
              <p className="text-xs text-textMuted">Historical trend across resume revisions</p>
            </div>
            <Badge variant="orange" size="sm">Score Growth</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="assessment" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pipeline Stage Distribution (BarChart) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wider">
                Application Pipeline Funnel
              </h3>
              <p className="text-xs text-textMuted">Opportunities categorized by active interview stage</p>
            </div>
            <Badge variant="neutral" size="sm">Active Pipeline</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="stage" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#262626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
