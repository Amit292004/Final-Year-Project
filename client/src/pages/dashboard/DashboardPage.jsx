import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Target,
  MessagesSquare,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { apiRequest } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentResumes, setRecentResumes] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest('/profiles/me').catch(() => ({ profile: null })),
      apiRequest('/analytics/overview').catch(() => ({ metrics: null })),
      apiRequest('/resumes').catch(() => ({ resumes: [] })),
      apiRequest('/jobs/matches').catch(() => ({ matches: [] }))
    ]).then(([profData, analyticsData, resumeData, matchData]) => {
      setProfile(profData.profile);
      setAnalytics(analyticsData);
      setRecentResumes(resumeData.resumes || []);
      setRecentMatches(matchData.matches || []);
      setLoading(false);
    });
  }, []);

  const candidateName = profile?.full_name || user?.user_metadata?.full_name || 'Candidate';
  const targetRole = profile?.target_role || 'Software Engineer';
  const metrics = analytics?.metrics || {
    resume_readiness: 82,
    best_job_match: 86,
    skills_to_improve: 4,
    interviews_completed: 3
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-borderStandard">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-carbon tracking-tight">
            Welcome back, {candidateName}
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
            Active Target Role:{' '}
            <span className="font-semibold text-carbon bg-peach/50 px-2 py-0.5 rounded border border-orange-200">
              {targetRole}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/resumes">
            <Button variant="outline" size="sm" icon={FileText}>
              Assess Resume
            </Button>
          </Link>
          <Link to="/matching">
            <Button variant="primary" size="sm" icon={Briefcase}>
              Match a Job
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Resume Readiness"
          value={`${metrics.resume_readiness} / 100`}
          subtext="Strong ATS format alignment"
          trend={+8}
          icon={FileText}
        />
        <MetricCard
          title="Best Job Match"
          value={`${metrics.best_job_match}%`}
          subtext="Top semantic overlap"
          trend={+12}
          icon={Briefcase}
        />
        <MetricCard
          title="Skills to Improve"
          value={metrics.skills_to_improve}
          subtext="Critical roadmap priorities"
          icon={Target}
        />
        <MetricCard
          title="Interview Practice"
          value={`${metrics.interviews_completed} Sessions`}
          subtext="Avg technical score: 8.2/10"
          icon={MessagesSquare}
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Latest Assessment & Job Match Pipeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Latest Resume Assessment Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-base text-carbon">Latest ATS Resume Assessment</h3>
                <p className="text-xs text-textMuted">Evaluated against {targetRole} industry benchmarks</p>
              </div>
              <Link to="/resumes">
                <Button variant="ghost" size="sm">View All Resumes</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-5 flex justify-center py-2">
                <ScoreGauge score={metrics.resume_readiness} maxScore={100} size={140} />
              </div>

              <div className="md:col-span-7 space-y-3.5 border-t md:border-t-0 md:border-l border-borderStandard pt-4 md:pt-0 md:pl-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-textSecondary">Formatting & Structure</span>
                    <span className="font-bold text-carbon">18 / 20</span>
                  </div>
                  <ProgressBar value={18} max={20} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-textSecondary">Keyword Relevance</span>
                    <span className="font-bold text-carbon">21 / 25</span>
                  </div>
                  <ProgressBar value={21} max={25} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-textSecondary">Content & Google X-Y-Z Impact</span>
                    <span className="font-bold text-carbon">16 / 20</span>
                  </div>
                  <ProgressBar value={16} max={20} />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link to="/ats-scorer">
                <Button variant="outline" size="sm">
                  <span>Open Full ATS Scorer & Matcher</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Semantic Job Matches */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-base text-carbon">Recent Job Description Matches</h3>
                <p className="text-xs text-textMuted">Dense sentence embedding analysis across required vs preferred qualifications</p>
              </div>
              <Link to="/matching">
                <Button variant="ghost" size="sm">New Match</Button>
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { company: 'Acme Cloud Systems', role: 'Junior Full Stack Engineer', match: 88, skills: ['React', 'Node.js', 'PostgreSQL'] },
                { company: 'Nexus Scale Labs', role: 'Backend API Developer', match: 81, skills: ['Python', 'FastAPI', 'Docker'] },
                { company: 'Horizon AI', role: 'Software Engineer - AI Platform', match: 74, skills: ['Python', 'PyTorch', 'Vector Search'] }
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-standard border border-borderStandard bg-neutralLight/30 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-carbon truncate">{m.role}</p>
                    <p className="text-[11px] text-textMuted">{m.company}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {m.skills.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-white border border-borderStandard rounded text-textSecondary font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-headline font-extrabold text-xl text-signature">{m.match}%</div>
                    <span className="text-[10px] text-textMuted font-semibold uppercase">Match Score</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 4 Cols: Skill Gaps & Active Roadmap */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skill Gap Priorities */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base text-carbon">Priority Skill Gaps</h3>
              <Link to="/skills" className="text-xs font-bold text-signature hover:text-burnt">
                Analyze All
              </Link>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Docker & Containers', category: 'DevOps', status: 'missing', importance: 'Critical' },
                { name: 'PostgreSQL Optimization', category: 'Database', status: 'partial', importance: 'Critical' },
                { name: 'System Design Patterns', category: 'Architecture', status: 'missing', importance: 'Important' },
                { name: 'CI/CD Automation', category: 'DevOps', status: 'missing', importance: 'Important' }
              ].map((gap, i) => (
                <div key={i} className="p-2.5 rounded-standard border border-borderStandard flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-carbon block">{gap.name}</span>
                    <span className="text-[10px] text-textMuted">{gap.category}</span>
                  </div>
                  <Badge variant={gap.status === 'missing' ? 'error' : 'warning'} size="sm">
                    {gap.importance}
                  </Badge>
                </div>
              ))}
            </div>

            <Link to="/roadmap" className="block pt-2">
              <Button variant="primary" size="sm" className="w-full">
                <span>Generate Learning Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </Card>

          {/* AI Career Advisor Prompt Card */}
          <Card className="bg-peach/30 border-orange-200 space-y-3">
            <div className="flex items-center gap-2 text-burnt font-bold text-xs">
              <Sparkles className="w-4 h-4 text-signature" />
              <span>AI Strategic Career Advisor</span>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              Have questions regarding salary negotiation, resume positioning, or technical interview strategies?
            </p>
            <Link to="/advisor">
              <Button variant="secondary" size="sm" className="w-full">
                Chat With Career Advisor
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
