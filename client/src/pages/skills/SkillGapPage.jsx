import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Target,
  Copy,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Map,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Code2,
  BookOpen,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { apiRequest } from '../../lib/apiClient';

// Target role benchmarks
const ROLE_BENCHMARKS = [
  { id: 'swe', name: 'Software Engineer', level: 'Mid-Level (L4)', postings: '14,200+' },
  { id: 'fullstack', name: 'Full Stack Engineer', level: 'Mid-Level (L4)', postings: '18,500+' },
  { id: 'backend', name: 'Backend Engineer', level: 'Senior (L5)', postings: '12,900+' },
  { id: 'frontend', name: 'Frontend Engineer', level: 'Mid-Level (L4)', postings: '11,400+' },
  { id: 'devops', name: 'DevOps & Platform Engineer', level: 'Mid-Level (L4)', postings: '9,800+' }
];

// Curated technical intelligence for actionable gap bridging
const SKILL_INTELLIGENCE = {
  docker: {
    category: 'DevOps',
    recruiterWhy: 'Standard requirement for containerized microservices and reproducible dev/test/production environments.',
    projectBlueprint: 'Build a multi-container Docker Compose application (client, REST API, and PostgreSQL) with multi-stage production Dockerfiles and health checks.',
    resumeBullet: 'Containerized multi-tier web application using multi-stage Dockerfiles and Docker Compose, reducing local developer onboarding time by 60%.',
    resource: { title: 'Docker Official Documentation', url: 'https://docs.docker.com/get-started/' }
  },
  postgresql: {
    category: 'Database',
    recruiterWhy: 'Industry standard relational database; teams evaluate schema design, query indexing, and data integrity.',
    projectBlueprint: 'Implement relational schema with composite indexes, connection pooling via PgBouncer, and query optimization using EXPLAIN ANALYZE.',
    resumeBullet: 'Architected PostgreSQL database schema with composite indexing and optimized slow queries, reducing p95 latency by 42%.',
    resource: { title: 'PostgreSQL Performance Optimization', url: 'https://www.postgresql.org/docs/current/performance-tips.html' }
  },
  'system design': {
    category: 'Architecture',
    recruiterWhy: 'Core benchmark for engineering screens; validates your ability to build scalable, fault-tolerant distributed systems.',
    projectBlueprint: 'Design a distributed rate limiter or URL shortener with Redis token-bucket caching, CDN caching, and asynchronous task queues.',
    resumeBullet: 'Designed distributed API rate-limiting architecture handling 10k requests/min using Redis caching and asynchronous fallback queues.',
    resource: { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }
  },
  'ci/cd pipelines': {
    category: 'DevOps',
    recruiterWhy: 'Modern engineering teams require developers who can automate linting, test suites, and safe production deployments.',
    projectBlueprint: 'Configure a GitHub Actions workflow matrix that runs linting, unit test suites, and builds/pushes a semantic-versioned container image.',
    resumeBullet: 'Engineered automated GitHub Actions CI/CD pipeline executing test suites on pull requests, trimming release cycle time from 2 hours to 8 minutes.',
    resource: { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' }
  },
  redis: {
    category: 'Database',
    recruiterWhy: 'Critical skill for backend throughput, session management, and pub/sub message brokering.',
    projectBlueprint: 'Integrate Redis caching into an existing API with TTL expiration and Cache-Aside pattern for read-heavy endpoints.',
    resumeBullet: 'Implemented Redis Cache-Aside caching layer for read-heavy API endpoints, achieving an 85% cache hit ratio and cutting DB load by 50%.',
    resource: { title: 'Redis Caching Architecture', url: 'https://redis.io/docs/data-types/' }
  },
  kubernetes: {
    category: 'Cloud',
    recruiterWhy: 'Standard cloud orchestration framework for scaling microservices and declarative infrastructure.',
    projectBlueprint: 'Deploy a containerized application to a local Minikube/Kind cluster with Deployments, ConfigMaps, Secrets, and Ingress routing.',
    resumeBullet: 'Orchestrated zero-downtime rolling deployments using Kubernetes Deployments and Ingress controllers with declarative manifests.',
    resource: { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/tutorials/' }
  },
  python: {
    category: 'Backend',
    recruiterWhy: 'Primary backend language for services, data engineering, and AI applications.',
    projectBlueprint: 'Build an asynchronous REST backend with Python 3.12, type hints, Pydantic validation, and comprehensive Pytest coverage.',
    resumeBullet: 'Developed high-throughput asynchronous backend microservices in Python and FastAPI, serving 2M+ monthly API requests.',
    resource: { title: 'Python Official Documentation', url: 'https://docs.python.org/3/' }
  },
  fastapi: {
    category: 'Framework',
    recruiterWhy: 'High-performance Python web framework for async APIs with automatic OpenAPI generation.',
    projectBlueprint: 'Implement an authenticated REST API with JWT authorization, background tasks, and async database sessions.',
    resumeBullet: 'Architected REST API with FastAPI and async SQLAlchemy, reducing average endpoint response time by 35%.',
    resource: { title: 'FastAPI Tutorial', url: 'https://fastapi.tiangolo.com/' }
  }
};

export function SkillGapPage() {
  const navigate = useNavigate();
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Benchmark and Filtering
  const [selectedBenchmark, setSelectedBenchmark] = useState(ROLE_BENCHMARKS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, missing, partial, verified

  // Modals
  const [activeModalSkill, setActiveModalSkill] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSkillForm, setNewSkillForm] = useState({
    skill_name: '',
    category: 'DevOps',
    importance: 'important',
    status: 'missing',
    current_evidence: 'Manual benchmark entry'
  });

  const showToast = (msg) => {
    toast.success(msg);
  };

  const fetchGaps = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await apiRequest('/skills/gaps');
      setGaps(data.gaps || []);
    } catch (err) {
      console.error('Failed to load skill gaps:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGaps(true);
    showToast('Benchmark synced with resume profile');
  };

  const handleCopyMissing = () => {
    const missing = gaps
      .filter(g => g.status === 'missing' || g.status === 'unvalidated')
      .map(g => g.skill_name)
      .join(', ');

    if (!missing) {
      showToast('No missing skills found');
      return;
    }

    navigator.clipboard.writeText(missing);
    showToast(`Copied ${missing.split(',').length} missing skills to clipboard`);
  };

  const handleCreateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      const missingSkills = gaps
        .filter(g => g.status === 'missing' || g.status === 'unvalidated' || g.status === 'partial')
        .map(g => g.skill_name);

      await apiRequest('/roadmaps', {
        method: 'POST',
        body: JSON.stringify({
          targetRole: selectedBenchmark.name,
          missingSkills: missingSkills.length > 0 ? missingSkills : ['Docker', 'PostgreSQL', 'System Design', 'CI/CD Pipelines'],
          weeklyHours: 10
        })
      });

      showToast('Learning roadmap generated');
      setTimeout(() => navigate('/roadmap'), 500);
    } catch (err) {
      toast.error('Failed to generate roadmap: ' + (err.message || 'Server error'));
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const handleUpdateStatus = async (gapId, newStatus) => {
    try {
      await apiRequest(`/skills/gaps/${gapId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      setGaps(prev => prev.map(g => g.id === gapId ? { ...g, status: newStatus } : g));
      if (activeModalSkill && activeModalSkill.id === gapId) {
        setActiveModalSkill(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status: ' + (err.message || 'API error'));
    }
  };

  const handleAddCustomSkill = async (e) => {
    e.preventDefault();
    if (!newSkillForm.skill_name.trim()) return;

    try {
      const res = await apiRequest('/skills/gaps', {
        method: 'POST',
        body: JSON.stringify({
          ...newSkillForm,
          target_role: selectedBenchmark.name
        })
      });

      if (res.gap) {
        setGaps(prev => [res.gap, ...prev]);
        setIsAddModalOpen(false);
        setNewSkillForm({
          skill_name: '',
          category: 'DevOps',
          importance: 'important',
          status: 'missing',
          current_evidence: 'Manual benchmark entry'
        });
        showToast(`Added ${res.gap.skill_name} to matrix`);
      }
    } catch (err) {
      toast.error('Failed to add competency: ' + (err.message || 'API error'));
    }
  };

  // Metrics
  const verifiedCount = gaps.filter(g => g.status === 'verified').length;
  const partialCount = gaps.filter(g => g.status === 'partial' || g.status === 'unvalidated').length;
  const missingCount = gaps.filter(g => g.status === 'missing').length;
  const totalCount = gaps.length || 1;
  const readinessPct = Math.min(100, Math.round(((verifiedCount * 1.0 + partialCount * 0.4) / totalCount) * 100));

  // Filtered gaps
  const filteredGaps = useMemo(() => {
    return gaps.filter(gap => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = gap.skill_name?.toLowerCase().includes(q);
        const matchCat = gap.category?.toLowerCase().includes(q);
        const matchEv = gap.current_evidence?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchEv) return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'partial') {
          if (gap.status !== 'partial' && gap.status !== 'unvalidated') return false;
        } else if (gap.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [gaps, searchQuery, statusFilter]);

  const getSkillMeta = (skillName) => {
    const key = (skillName || '').toLowerCase().trim();
    return SKILL_INTELLIGENCE[key] || {
      category: 'Technical',
      recruiterWhy: `Commonly evaluated capability for ${selectedBenchmark.name} positions.`,
      projectBlueprint: `Create a dedicated showcase repository on GitHub demonstrating implementation, error handling, and tests for ${skillName}.`,
      resumeBullet: `Implemented and maintained ${skillName} services, optimizing code maintainability and team delivery cadence.`,
      resource: { title: `${skillName} Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' documentation')}` }
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-carbon text-white text-xs font-medium px-4 py-2.5 rounded-btn shadow-lg border border-graphite flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-3.5 h-3.5 text-signature" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-extrabold text-2xl text-carbon">
              Skill Gap Analysis
            </h1>
          </div>
          <p className="text-xs text-textSecondary mt-0.5">
            Compare your verified resume competencies against target role benchmarks and market demand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
            title="Sync with latest parsed resume"
          >
            Sync Benchmark
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Copy}
            onClick={handleCopyMissing}
          >
            Copy Missing Skills
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Map}
            loading={generatingRoadmap}
            onClick={handleCreateRoadmap}
          >
            Create Learning Roadmap
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards - Clean, professional, zero border-clipping artifacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Role Readiness */}
        <div className="bg-white rounded-standard border border-borderStandard p-5 shadow-xs hover:border-borderStrong transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
              Role Readiness
            </span>
            <div className="w-8 h-8 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline font-extrabold text-3xl text-carbon tracking-tight">
            {readinessPct}%
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-textSecondary">
            <span className="w-1.5 h-1.5 rounded-full bg-signature shrink-0" />
            <span>{verifiedCount} of {totalCount} benchmarks verified</span>
          </div>
        </div>

        {/* Card 2: Verified Skills */}
        <div className="bg-white rounded-standard border border-borderStandard p-5 shadow-xs hover:border-borderStrong transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
              Verified Skills
            </span>
            <div className="w-8 h-8 rounded-btn bg-semanticSuccessBg text-semanticSuccess flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline font-extrabold text-3xl text-carbon tracking-tight">
            {verifiedCount}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-semanticSuccess font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-semanticSuccess shrink-0" />
            <span>Explicitly evidenced on resume</span>
          </div>
        </div>

        {/* Card 3: Partial Matches */}
        <div className="bg-white rounded-standard border border-borderStandard p-5 shadow-xs hover:border-borderStrong transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
              Partial Matches
            </span>
            <div className="w-8 h-8 rounded-btn bg-amber-50 text-semanticWarning flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline font-extrabold text-3xl text-carbon tracking-tight">
            {partialCount}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-semanticWarning font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-semanticWarning shrink-0" />
            <span>Related tooling or theory cited</span>
          </div>
        </div>

        {/* Card 4: Critical Gaps */}
        <div className="bg-white rounded-standard border border-borderStandard p-5 shadow-xs hover:border-borderStrong transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
              Critical Gaps
            </span>
            <div className="w-8 h-8 rounded-btn bg-semanticErrorBg text-semanticError flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline font-extrabold text-3xl text-carbon tracking-tight">
            {missingCount}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-semanticError font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-semanticError shrink-0" />
            <span>High priority for target role</span>
          </div>
        </div>
      </div>

      {/* Role Competency Matrix Card */}
      <Card padded={false} className="overflow-hidden shadow-xs">
        {/* Card Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-borderStandard bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-base text-carbon">
                Role Competency Matrix
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-textSecondary">
              <span>Benchmark:</span>
              <select
                value={selectedBenchmark.id}
                onChange={(e) => {
                  const b = ROLE_BENCHMARKS.find(x => x.id === e.target.value);
                  if (b) setSelectedBenchmark(b);
                }}
                className="font-semibold text-carbon bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-0 p-0 hover:text-signature transition"
              >
                {ROLE_BENCHMARKS.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Toolbar: Search, Filter Tabs, Add Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-7 py-1.5 rounded-btn border border-borderStandard bg-white focus:outline-none focus:ring-1 focus:ring-signature focus:border-signature text-carbon placeholder:text-textDisabled w-44 sm:w-52"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-textDisabled hover:text-carbon"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="inline-flex rounded-btn border border-borderStandard p-0.5 bg-neutralLight/40">
              {[
                { id: 'all', label: 'All' },
                { id: 'missing', label: 'Missing' },
                { id: 'partial', label: 'Partial' },
                { id: 'verified', label: 'Verified' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-btn transition ${
                    statusFilter === tab.id
                      ? 'bg-white text-carbon font-semibold shadow-xs'
                      : 'text-textSecondary hover:text-carbon'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Add Custom Competency Button */}
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs h-8 px-2.5"
            >
              Add Skill
            </Button>
          </div>
        </div>

        {/* Competency Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutralLight/50 text-textMuted uppercase text-[10px] font-bold tracking-wider border-b border-borderStandard">
              <tr>
                <th className="py-3 px-6">Skill Name</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Importance</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Identified Evidence</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderStandard bg-white">
              {filteredGaps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-textMuted">
                    <p className="font-semibold text-carbon">No skills match your search</p>
                    <button
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                      className="mt-2 text-xs font-semibold text-signature hover:underline"
                    >
                      Clear search
                    </button>
                  </td>
                </tr>
              ) : (
                filteredGaps.map((gap) => {
                  const meta = getSkillMeta(gap.skill_name);
                  const isCritical = gap.importance === 'critical';
                  const isImportant = gap.importance === 'important';
                  const isVerified = gap.status === 'verified';
                  const isPartial = gap.status === 'partial' || gap.status === 'unvalidated';
                  const isMissing = gap.status === 'missing';

                  return (
                    <tr
                      key={gap.id}
                      className="hover:bg-neutralLight/25 transition cursor-pointer group"
                      onClick={() => setActiveModalSkill(gap)}
                    >
                      {/* Skill Name */}
                      <td className="py-3.5 px-6 font-semibold text-carbon group-hover:text-signature transition">
                        {gap.skill_name}
                      </td>

                      {/* Category - Clean uniform neutral tag */}
                      <td className="py-3.5 px-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutralLight text-textSecondary border border-borderStandard/60">
                          {gap.category || meta.category || 'TECHNICAL'}
                        </span>
                      </td>

                      {/* Importance - Clean subtle typography */}
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 font-semibold text-xs ${
                          isCritical
                            ? 'text-semanticError'
                            : isImportant
                            ? 'text-semanticWarning'
                            : 'text-textMuted font-medium'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isCritical
                              ? 'bg-semanticError'
                              : isImportant
                              ? 'bg-semanticWarning'
                              : 'bg-textDisabled'
                          }`} />
                          <span className="capitalize">{gap.importance}</span>
                        </span>
                      </td>

                      {/* Status - Clean subtle badge */}
                      <td className="py-3.5 px-6">
                        <Badge
                          variant={isVerified ? 'success' : isPartial ? 'warning' : 'error'}
                          size="sm"
                        >
                          <span className="capitalize">
                            {isPartial ? 'partial' : gap.status}
                          </span>
                        </Badge>
                      </td>

                      {/* Identified Evidence */}
                      <td className="py-3.5 px-6 text-textSecondary max-w-sm">
                        <p className="line-clamp-1">
                          {gap.current_evidence || 'Not identified in parsed resume'}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveModalSkill(gap)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-signature hover:text-burnt transition"
                        >
                          <span>Bridge Gap</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive Detail Modal: "Bridge Gap" */}
      {activeModalSkill && (
        <Modal
          isOpen={!!activeModalSkill}
          onClose={() => setActiveModalSkill(null)}
          title={`Bridge Gap: ${activeModalSkill.skill_name}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-textMuted font-medium">Status:</span>
                <select
                  value={activeModalSkill.status}
                  onChange={(e) => handleUpdateStatus(activeModalSkill.id, e.target.value)}
                  className="text-xs border border-borderStandard rounded-btn px-2.5 py-1.5 font-semibold text-carbon focus:ring-signature focus:outline-none bg-white"
                >
                  <option value="missing">Missing</option>
                  <option value="partial">Partial Match</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModalSkill(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Map}
                  onClick={() => {
                    setActiveModalSkill(null);
                    handleCreateRoadmap();
                  }}
                >
                  Add to Roadmap
                </Button>
              </div>
            </div>
          }
        >
          {(() => {
            const meta = getSkillMeta(activeModalSkill.skill_name);
            return (
              <div className="space-y-4 text-xs">
                {/* Benchmark Context */}
                <div className="flex items-center justify-between p-3 bg-neutralLight/40 rounded-standard border border-borderStandard">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-borderStandard text-textSecondary">
                      {activeModalSkill.category || meta.category}
                    </span>
                    <span className="text-textSecondary font-medium">
                      Target Role: <strong className="text-carbon">{selectedBenchmark.name}</strong>
                    </span>
                  </div>
                  <span className="font-semibold capitalize text-carbon">
                    Priority: {activeModalSkill.importance}
                  </span>
                </div>

                {/* Why This Skill Matters */}
                <div>
                  <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-textMuted mb-1">
                    Recruiter Benchmark Context
                  </h4>
                  <p className="text-textSecondary leading-relaxed bg-white p-3 rounded-btn border border-borderStandard">
                    {meta.recruiterWhy}
                  </p>
                </div>

                {/* Evidence on Resume */}
                <div>
                  <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-textMuted mb-1">
                    Identified Resume Evidence
                  </h4>
                  <div className="p-3 bg-white rounded-btn border border-borderStandard text-textSecondary">
                    {activeModalSkill.current_evidence || 'No verifiable evidence detected on resume.'}
                  </div>
                </div>

                {/* Hands-on Project Blueprint */}
                <div>
                  <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-textMuted mb-1">
                    Recommended Project Proof
                  </h4>
                  <div className="p-3 bg-white rounded-btn border border-borderStandard text-textSecondary leading-relaxed">
                    {meta.projectBlueprint}
                  </div>
                </div>

                {/* Copyable Resume Bullet Template */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-textMuted">
                      Suggested Resume Bullet Point
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meta.resumeBullet);
                        showToast('Copied bullet to clipboard');
                      }}
                      className="text-[11px] font-semibold text-signature hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Bullet
                    </button>
                  </div>
                  <div className="p-3 bg-neutralLight/30 rounded-btn border border-borderStandard text-carbon text-xs leading-relaxed font-mono">
                    "{meta.resumeBullet}"
                  </div>
                </div>

                {/* Documentation Link */}
                {meta.resource && (
                  <div className="pt-1">
                    <a
                      href={meta.resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-signature hover:underline font-semibold"
                    >
                      <span>{meta.resource.title}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Add Custom Competency Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Target Competency"
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddCustomSkill}>
                Save Competency
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAddCustomSkill} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-textSecondary uppercase tracking-wider mb-1">
                Skill Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kubernetes, TypeScript, AWS, GraphQL"
                value={newSkillForm.skill_name}
                onChange={(e) => setNewSkillForm({ ...newSkillForm, skill_name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-borderStandard rounded-btn focus:outline-none focus:ring-1 focus:ring-signature"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-textSecondary uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newSkillForm.category}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-borderStandard rounded-btn focus:outline-none focus:ring-1 focus:ring-signature bg-white"
                >
                  <option value="DevOps">DevOps</option>
                  <option value="Database">Database</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-textSecondary uppercase tracking-wider mb-1">
                  Importance
                </label>
                <select
                  value={newSkillForm.importance}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, importance: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-borderStandard rounded-btn focus:outline-none focus:ring-1 focus:ring-signature bg-white"
                >
                  <option value="critical">Critical</option>
                  <option value="important">Important</option>
                  <option value="bonus">Bonus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-textSecondary uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={newSkillForm.status}
                onChange={(e) => setNewSkillForm({ ...newSkillForm, status: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-borderStandard rounded-btn focus:outline-none focus:ring-1 focus:ring-signature bg-white"
              >
                <option value="missing">Missing</option>
                <option value="partial">Partial</option>
                <option value="verified">Verified</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-textSecondary uppercase tracking-wider mb-1">
                Identified Evidence / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes regarding this skill..."
                value={newSkillForm.current_evidence}
                onChange={(e) => setNewSkillForm({ ...newSkillForm, current_evidence: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-borderStandard rounded-btn focus:outline-none focus:ring-1 focus:ring-signature"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
