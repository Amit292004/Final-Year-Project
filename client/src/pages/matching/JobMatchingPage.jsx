import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Target,
  MessagesSquare,
  BookmarkPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { apiRequest } from '../../lib/apiClient';

const PRESET_JOBS = [
  {
    company: "Stripe",
    title: "Full Stack Software Engineer",
    description: `About the Role:
We are looking for a Full Stack Software Engineer to build scalable financial workflow tools and distributed merchant services.

Requirements:
- 2+ years experience building web applications with Python and React
- Proficiency in PostgreSQL database design, query optimization, and schema migrations
- Strong hands-on knowledge of Docker containers and CI/CD automation pipelines
- Solid understanding of REST APIs, webhooks, and secure authentication protocols

Preferred / Bonus:
- Experience with Redis caching mechanisms and message queues
- Familiarity with Kubernetes and cloud deployments (AWS or GCP)`
  },
  {
    company: "Cloudflare",
    title: "Backend Systems Engineer",
    description: `About the Role:
Join the Cloudflare Developer Platform team to build high-concurrency microservices, edge computing integrations, and distributed gateway APIs.

Requirements:
- Strong experience with Python (FastAPI/asyncio) or Go for high-throughput backend services
- Proficiency in PostgreSQL database performance tuning, indexing strategies, and concurrency control
- Practical experience with Docker containers, Linux system architecture, and GitOps workflows
- Solid grasp of networking concepts, HTTP/2, TLS, and microservice resilience patterns

Preferred / Bonus:
- Experience implementing vector search or similarity indexing (pgvector/FAISS)
- Contributions to open-source developer tooling or distributed systems`
  },
  {
    company: "Linear",
    title: "Frontend Engineer (Application Core)",
    description: `About the Role:
We are looking for an exceptional Frontend Engineer to craft fast, responsive, and tactile web interfaces for high-velocity software teams.

Requirements:
- High proficiency in modern React 18, TypeScript, Tailwind CSS, and component design systems
- Experience with client-side state management, optimistic updates, and REST/GraphQL APIs
- Obsessive attention to detail in UX, keyboard accessibility, micro-interactions, and rendering performance
- Familiarity with testing frameworks (Jest, Playwright) and modern build toolchains (Vite)

Preferred / Bonus:
- Experience building developer tools, project tracking boards, or desktop web applications
- Strong eye for typography, layout hierarchy, and design engineering`
  },
  {
    company: "Scale AI",
    title: "AI / ML Platform Engineer",
    description: `About the Role:
Scale AI builds the data foundation for generative AI. We are looking for an ML Platform Engineer to build scalable evaluation and vector indexing pipelines.

Requirements:
- Strong Python programming with experience in PyTorch, Hugging Face Transformers, or LangChain
- Experience with dense sentence embeddings, cosine similarity search, and vector databases (pgvector/Milvus)
- Experience with FastAPI backend services handling LLM inference and RAG pipelines
- Comfortable working with Docker, GPU instances, and cloud orchestration (AWS/GCP)

Preferred / Bonus:
- Knowledge of Retrieval-Augmented Generation (RAG) evaluation benchmarks
- Experience with STAR behavioral evaluation rubrics and automated grading`
  }
];

export function JobMatchingPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState(PRESET_JOBS[0].title);
  const [company, setCompany] = useState(PRESET_JOBS[0].company);
  const [jobDescription, setJobDescription] = useState(PRESET_JOBS[0].description);
  const [activePreset, setActivePreset] = useState(0);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedToTracker, setSavedToTracker] = useState(false);

  useEffect(() => {
    apiRequest('/resumes').then((data) => {
      const list = data.resumes || [];
      setResumes(list);
      if (list.length > 0) setSelectedResumeId(list[0].id);
    }).catch(console.error);
  }, []);

  const handleAnalyzeMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription) return;

    setLoading(true);
    setSavedToTracker(false);
    try {
      const res = await apiRequest('/jobs/matches', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: selectedResumeId || null,
          resumeText: resumes.find(r => String(r.id) === String(selectedResumeId))?.parsed_data?.raw_text || "Experienced software engineer with skills in Python, React, PostgreSQL, Docker, and REST APIs.",
          jobDescription,
          jobTitle,
          company
        })
      });
      setMatchResult(res.match);
      toast.success('Job matched successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to match job.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToTracker = async () => {
    if (!matchResult) return;
    try {
      await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({
          company: matchResult.company,
          role: matchResult.job_title,
          stage: 'preparing',
          notes: `Semantic match score: ${matchResult.overall_score}%. Required skill coverage: ${matchResult.required_skill_coverage}%.`
        })
      });
      setSavedToTracker(true);
      toast.success('Saved to Application Tracker!');
    } catch (err) {
      toast.error('Failed to save to application tracker.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-borderStandard">
        <h1 className="font-headline font-extrabold text-2xl text-carbon">
          Semantic Job Matching
        </h1>
        <p className="text-xs text-textSecondary mt-0.5">
          Evaluate required and preferred job posting requirements against your resume using 384-dimensional dense sentence embeddings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wider">
                Target Role & Job Posting
              </h3>
              <span className="text-[10px] text-textMuted font-semibold">Load Role Preset</span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-2">
              {PRESET_JOBS.map((preset, idx) => (
                <button
                  key={preset.company}
                  type="button"
                  onClick={() => {
                    setActivePreset(idx);
                    setCompany(preset.company);
                    setJobTitle(preset.title);
                    setJobDescription(preset.description);
                    setMatchResult(null);
                  }}
                  className={`p-2 rounded-btn text-left text-xs border transition ${
                    activePreset === idx
                      ? 'border-signature bg-peach/40 text-carbon font-semibold'
                      : 'border-borderStandard bg-white text-textSecondary hover:bg-neutralLight/40'
                  }`}
                >
                  <span className="block font-bold truncate">{preset.company}</span>
                  <span className="text-[10px] text-textMuted block truncate">{preset.title}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleAnalyzeMatch} className="space-y-4 pt-2 border-t border-borderStandard">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
                  Evaluate Against Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-standard border border-borderStandard px-3 py-2 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title} ({r.target_role})</option>
                  ))}
                  {resumes.length === 0 && <option value="">Default Profile Skills</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Role Title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
                <Input
                  label="Company Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
                  Job Description Text
                </label>
                <textarea
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-standard border border-borderStandard p-3 text-xs focus:ring-2 focus:ring-signature focus:outline-none font-mono"
                  placeholder="Paste the full job specification here..."
                  required
                />
              </div>

              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Run Semantic Match
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Match Report (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {!matchResult && !loading ? (
            <Card className="p-12 text-center text-textMuted text-xs flex flex-col items-center justify-center space-y-3">
              <Briefcase className="w-10 h-10 text-textDisabled" />
              <p className="font-semibold text-carbon">No Match Analysis Run Yet</p>
              <p className="max-w-xs text-textSecondary">
                Paste a job description on the left and run analysis to inspect semantic alignment and skill coverage.
              </p>
            </Card>
          ) : matchResult ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Overall Score Card */}
              <Card className="bg-white border-borderStrong p-6">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-5 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-borderStandard pb-4 sm:pb-0 sm:pr-4">
                    <ScoreGauge score={matchResult.overall_score} maxScore={100} size={140} sublabel="Semantic Match" />
                  </div>

                  <div className="sm:col-span-7 space-y-3">
                    <h3 className="font-headline font-bold text-base text-carbon">
                      {matchResult.job_title} at {matchResult.company}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-textSecondary">Required Skills Coverage</span>
                        <span className="font-bold text-carbon">{matchResult.required_skill_coverage}%</span>
                      </div>
                      <ProgressBar value={matchResult.required_skill_coverage} max={100} />

                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-textSecondary">Preferred Skills Coverage</span>
                        <span className="font-bold text-carbon">{matchResult.preferred_skill_coverage}%</span>
                      </div>
                      <ProgressBar value={matchResult.preferred_skill_coverage} max={100} color="bg-amber-500" />

                      <div className="flex justify-between text-xs pt-1">
                        <span className="font-medium text-textSecondary">Semantic Similarity (Sentence-Transformers)</span>
                        <span className="font-bold text-indigo-600">{matchResult.semantic_similarity}%</span>
                      </div>
                      <ProgressBar value={matchResult.semantic_similarity} max={100} color="bg-indigo-600" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-borderStandard">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={BookmarkPlus}
                    onClick={handleSaveToTracker}
                    disabled={savedToTracker}
                  >
                    {savedToTracker ? 'Saved to Tracker ✓' : 'Save to Job Tracker'}
                  </Button>
                  <Link to="/skills">
                    <Button variant="outline" size="sm" icon={Target}>
                      View Skill Gaps
                    </Button>
                  </Link>
                  <Link to="/roadmap">
                    <Button variant="outline" size="sm">
                      Learning Roadmap
                    </Button>
                  </Link>
                  <Link to="/interview">
                    <Button variant="primary" size="sm" icon={MessagesSquare}>
                      Prepare for Interview
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Fuzzy Keywords & Skills Gap Matrix */}
              {((matchResult.matched_keywords?.length > 0) || (matchResult.missing_keywords?.length > 0) || (matchResult.skills_gap?.length > 0)) && (
                <Card className="space-y-4">
                  <h4 className="font-headline font-bold text-xs text-carbon uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-signature" />
                    Fuzzy Keyword Alignment & Skills Gap Analysis
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Matched Keywords */}
                    <div className="space-y-2">
                      <span className="font-bold text-emerald-800 uppercase text-[10px] block">
                        ✅ Matched Terms ({matchResult.matched_keywords?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                        {(matchResult.matched_keywords || []).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="space-y-2">
                      <span className="font-bold text-red-800 uppercase text-[10px] block">
                        ❌ Missing Terms ({matchResult.missing_keywords?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                        {(matchResult.missing_keywords || []).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-800 border border-red-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills Gap */}
                    <div className="space-y-2">
                      <span className="font-bold text-amber-800 uppercase text-[10px] block">
                        📊 Skills Gap ({matchResult.skills_gap?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                        {(matchResult.skills_gap || []).map((sg, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-900 border border-amber-200">
                            {sg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Matched vs Missing Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <Card className="space-y-3">
                  <div className="flex items-center gap-2 text-semanticSuccess font-bold text-xs uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Requirements ({matchResult.matched_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(matchResult.matched_skills || []).map((m, i) => (
                      <Badge key={i} variant="success" size="sm">
                        {typeof m === 'string' ? m : (m?.skill || 'Matched')}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Missing Skills */}
                <Card className="space-y-3">
                  <div className="flex items-center gap-2 text-semanticError font-bold text-xs uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4" />
                    <span>Missing Skills ({matchResult.missing_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(matchResult.missing_skills || []).map((m, i) => (
                      <Badge key={i} variant="error" size="sm">
                        {typeof m === 'string' ? m : (m?.skill || 'Requirement')}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Supporting Passages Evidence */}
              {matchResult.supporting_passages?.length > 0 && (
                <Card className="space-y-3">
                  <h4 className="font-headline font-bold text-xs text-carbon uppercase tracking-wide">
                    Supporting Resume Evidence
                  </h4>
                  <div className="space-y-2">
                    {matchResult.supporting_passages.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-neutralLight/40 text-xs border border-borderStandard">
                        <span className="font-bold text-burnt mr-2">{p.skill}:</span>
                        <span className="text-textSecondary">"{p.passage}"</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
