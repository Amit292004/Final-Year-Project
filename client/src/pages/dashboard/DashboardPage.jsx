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
  CheckCircle2,
  Clock,
  Compass,
  FileCheck
} from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AnimateIn } from '../../components/ui/AnimateIn';
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <AnimateIn delay={0}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-borderStandard">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-overline text-textSecondary font-semibold">WORKSPACE ACTIVE</span>
            </div>
            <h1 className="text-heading text-2xl sm:text-3xl text-carbon">
              {getGreeting()}, {candidateName}
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-0.5 flex items-center gap-2">
              Target Track:
              <span className="font-semibold text-carbon bg-peach/70 px-2.5 py-0.5 rounded-btn border border-orange-200/80 text-xs">
                {targetRole}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/ats-scorer">
              <Button variant="outline" size="sm" icon={FileCheck}>
                Score Resume
              </Button>
            </Link>
            <Link to="/matching">
              <Button variant="primary" size="sm" icon={Briefcase}>
                Match a Job
              </Button>
            </Link>
          </div>
        </div>
      </AnimateIn>

      {/* Asymmetric Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimateIn delay={1}>
          <MetricCard
            title="ATS Readiness"
            value={`${metrics.resume_readiness} / 100`}
            subtext="Calculated on 5 dimensions"
            trend={+8}
            icon={FileText}
          />
        </AnimateIn>
        <AnimateIn delay={2}>
          <MetricCard
            title="Best Job Overlap"
            value={`${metrics.best_job_match}%`}
            subtext="pgvector cosine similarity"
            trend={+12}
            icon={Briefcase}
          />
        </AnimateIn>
        <AnimateIn delay={3}>
          <MetricCard
            title="Skill Priorities"
            value={metrics.skills_to_improve}
            subtext="Key roadmap targets"
            icon={Target}
          />
        </AnimateIn>
        <AnimateIn delay={4}>
          <MetricCard
            title="Mock Practice"
            value={`${metrics.interviews_completed} Sessions`}
            subtext="Avg STAR score: 8.2 / 10"
            icon={MessagesSquare}
          />
        </AnimateIn>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Latest Assessment & Job Match Pipeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Latest Resume Assessment Card */}
          <AnimateIn delay={3}>
            <Card variant="elevated" className="space-y-4 border-borderStrong">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-overline text-signature font-semibold">LATEST AUDIT</span>
                  <h3 className="font-headline font-bold text-base sm:text-lg text-carbon">
                    ATS Readiness Diagnostic
                  </h3>
                  <p className="text-xs text-textMuted">Benchmark target: {targetRole}</p>
                </div>
                <Link to="/resumes">
                  <Button variant="ghost" size="sm">Resume Library</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                <div className="md:col-span-5 flex justify-center py-2">
                  <ScoreGauge score={metrics.resume_readiness} maxScore={100} size={145} />
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
                      <span className="font-medium text-textSecondary">Google X-Y-Z Achievement Impact</span>
                      <span className="font-bold text-carbon">16 / 20</span>
                    </div>
                    <ProgressBar value={16} max={20} />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end border-t border-borderStandard">
                <Link to="/ats-scorer">
                  <Button variant="outline" size="sm">
                    <span>Open Detailed Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </AnimateIn>

          {/* Recent Semantic Job Matches */}
          <AnimateIn delay={4}>
            <Card variant="default" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-overline text-blue-600 font-semibold">SEMANTIC VECTOR MATCHES</span>
                  <h3 className="font-headline font-bold text-base text-carbon">
                    Recent Job Specification Fits
                  </h3>
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
                  <div key={idx} className="p-3.5 rounded-card border border-borderStandard bg-neutralLight/30 flex items-center justify-between gap-4 hover:border-borderStrong transition-colors">
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
                      <div className="font-headline font-black text-xl text-signature">{m.match}%</div>
                      <span className="text-[10px] text-textMuted font-mono uppercase">Cosine Overlap</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </AnimateIn>
        </div>

        {/* Right 4 Cols: Skill Gaps & Active Roadmap */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skill Gap Priorities */}
          <AnimateIn delay={4}>
            <Card variant="default" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-overline text-amber-600 font-semibold">ROADMAP PRIORITIES</span>
                  <h3 className="font-headline font-bold text-base text-carbon">Target Competencies</h3>
                </div>
                <Link to="/skills" className="text-xs font-bold text-signature hover:text-burnt">
                  Matrix
                </Link>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Docker & Containers', category: 'DevOps', status: 'missing', importance: 'Critical' },
                  { name: 'PostgreSQL Optimization', category: 'Database', status: 'partial', importance: 'Critical' },
                  { name: 'System Design Patterns', category: 'Architecture', status: 'missing', importance: 'Important' },
                  { name: 'CI/CD Automation', category: 'DevOps', status: 'missing', importance: 'Important' }
                ].map((gap, i) => (
                  <div key={i} className="p-2.5 rounded-card border border-borderStandard flex items-center justify-between text-xs bg-white hover:border-borderStrong transition-colors">
                    <div>
                      <span className="font-semibold text-carbon block">{gap.name}</span>
                      <span className="text-[10px] text-textMuted font-mono">{gap.category}</span>
                    </div>
                    <Badge variant={gap.status === 'missing' ? 'error' : 'warning'} size="xs">
                      {gap.importance}
                    </Badge>
                  </div>
                ))}
              </div>

              <Link to="/roadmap" className="block pt-2">
                <Button variant="primary" size="sm" className="w-full">
                  <span>View Learning Milestones</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </Card>
          </AnimateIn>

          {/* AI Career Advisor Prompt Card */}
          <AnimateIn delay={5}>
            <Card variant="glass" className="border-orange-200/80 bg-peach/30 space-y-3">
              <div className="flex items-center gap-2 text-burnt font-bold text-xs">
                <Sparkles className="w-4 h-4 text-signature" />
                <span>Career Advisor</span>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed">
                Need guidance on positioning your technical projects or framing salary benchmarks?
              </p>
              <Link to="/advisor">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Career Advisor
                </Button>
              </Link>
            </Card>
          </AnimateIn>
        </div>
      </div>
    </div>
  );
}
