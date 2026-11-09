import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Target,
  Map,
  MessagesSquare,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  BarChart2,
  Layers,
  Cpu,
  Zap,
  Code2,
  Flame,
  Check,
  X,
  Volume2,
  BookOpen,
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';

export function LandingPage() {
  const [heroTab, setHeroTab] = useState('scorecard'); // scorecard, matching, rewrite, interview
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive Sandbox state
  const sampleBullets = [
    {
      original: "Worked on the backend API and fixed several bugs for our team.",
      optimized: "Architected asynchronous Python/FastAPI microservices handling 1.4M daily requests, reducing p99 API latency by 38% through Redis connection caching.",
      impact: "+22 ATS Impact Points",
      metric: "38% latency reduction • 1.4M daily requests",
      role: "Backend Engineer"
    },
    {
      original: "Built the front-end interface using React and Tailwind CSS.",
      optimized: "Engineered responsive candidate dashboards in React 18 and Tailwind CSS with sub-50ms render cycles, increasing user retention by 27% across 12,000 active sessions.",
      impact: "+19 ATS Impact Points",
      metric: "27% retention boost • 12k sessions",
      role: "Frontend Developer"
    },
    {
      original: "Maintained PostgreSQL database tables and wrote migration scripts.",
      optimized: "Designed normalized PostgreSQL schemas with composite B-Tree indexes and pgvector support, cutting database query execution times from 420ms to 65ms.",
      impact: "+24 ATS Impact Points",
      metric: "84% query speedup • 65ms p95 time",
      role: "Database Engineer"
    }
  ];

  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [customBullet, setCustomBullet] = useState('');
  const [sandboxResult, setSandboxResult] = useState(sampleBullets[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleSelectSample = (idx) => {
    setSelectedSampleIndex(idx);
    setCustomBullet('');
    setSandboxResult(sampleBullets[idx]);
  };

  const handleOptimizeCustom = (e) => {
    e.preventDefault();
    if (!customBullet.trim()) return;

    setIsOptimizing(true);
    setTimeout(() => {
      setSandboxResult({
        original: customBullet,
        optimized: `Engineered high-throughput technical workflows for ${customBullet.slice(0, 30)}..., delivering measurable performance uplift and quantifiable operational velocity using Google X-Y-Z achievement structure.`,
        impact: "+20 ATS Impact Points",
        metric: "Accomplished [X] measured by [Y] by doing [Z]",
        role: "Custom Analysis"
      });
      setIsOptimizing(false);
    }, 600);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the ATS readiness score calculate points objectively?",
      a: "Our scoring engine runs a deterministic 100-point rubric across 5 transparent dimensions: Formatting & Structure (20 pts), Keyword Relevance (25 pts), Content Quality & Google X-Y-Z Impact (20 pts), Skill Depth (20 pts), and ATS File Compatibility (15 pts). You receive exact mathematical point breakdowns with actionable remediation steps rather than arbitrary black-box percentages."
    },
    {
      q: "How is pgvector semantic matching different from standard keyword searching?",
      a: "Standard keyword checkers fail when you write 'Node.js backend' and the job requires 'server-side JavaScript engineering'. CareerFit AI converts both your experience statements and job specifications into 384-dimensional dense sentence embeddings (all-MiniLM-L6-v2), computing true conceptual cosine similarity to discover transferable qualifications."
    },
    {
      q: "Does the AI rewrite fabricate metrics or hallucinate experience?",
      a: "No. The system strictly follows Google's X-Y-Z achievement standard: 'Accomplished [X] measured by [Y] by doing [Z]'. If a quantifiable metric or parameter is recommended, it is explicitly flagged for verification so you never submit unearned or fabricated claims."
    },
    {
      q: "How does the RAG mock interview preparation operate?",
      a: "The interview module retrieves contextual technical criteria from your uploaded resume and target job posting. Questions are generated dynamically with real-time speech-to-text voice input and scored against the STAR method (Situation, Task, Action, Result) with targeted coaching on technical accuracy and communication conciseness."
    },
    {
      q: "Is CareerFit AI open and free to use?",
      a: "Yes. CareerFit AI is built as a complete, unrestricted career intelligence platform for students, job seekers, and engineers. Every module—ATS scoring, pgvector job matching, customized skill roadmaps, and mock interview coaching—is fully accessible without paywalls, subscriptions, or credit card requirements."
    },
    {
      q: "Is my personal resume information protected?",
      a: "All uploaded candidate data is isolated with strict Row Level Security (RLS) policies and never shared or sold. The parser also alerts you if sensitive personal data (such as full home addresses or birth dates) is detected, recommending modern resume hygiene."
    }
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach border border-orange-200 text-burnt text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-signature" />
              <span>Deterministic AI • 100-Point Explainable Rubric • Zero Paywalls</span>
            </div>

            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-carbon tracking-tight leading-[1.1]">
              Target Your Dream Role <br className="hidden sm:inline" />
              <span className="text-signature underline decoration-peach decoration-wavy underline-offset-8">
                With Scientific Clarity.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-textSecondary max-w-xl leading-relaxed">
              Eliminate guesswork from your tech career search. Evaluate your resume against a deterministic 100-point ATS rubric, match job requirements with dense 384-d semantic embeddings, bridge critical skill gaps with personalized milestone roadmaps, and practice voice-enabled RAG mock interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <span>Launch Free Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href="#sandbox">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Try Interactive Sandbox
                </Button>
              </a>
            </div>

            {/* Technical Verification Highlights */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-borderStandard text-xs text-textSecondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-semanticSuccess shrink-0" />
                <span className="font-medium">100-Point Explainable Rubric</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-semanticSuccess shrink-0" />
                <span className="font-medium">Dense pgvector Embeddings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-semanticSuccess shrink-0" />
                <span className="font-medium">Google X-Y-Z Achievement Syntax</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Multi-Tab Product Preview */}
          <div className="lg:col-span-5">
            <Card padded={false} className="border-borderStrong shadow-2xl bg-white overflow-hidden">
              {/* Card Window Header */}
              <div className="px-4 py-3 bg-carbon text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-medium text-gray-300 ml-2">careerfit-engine // live-preview</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-emerald-400">
                  Ready
                </span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex border-b border-borderStandard bg-neutralLight/40 text-xs font-medium">
                <button
                  onClick={() => setHeroTab('scorecard')}
                  className={`flex-1 py-2.5 px-3 text-center transition ${
                    heroTab === 'scorecard'
                      ? 'bg-white text-signature font-bold border-b-2 border-signature'
                      : 'text-textSecondary hover:text-carbon'
                  }`}
                >
                  ATS Score
                </button>
                <button
                  onClick={() => setHeroTab('matching')}
                  className={`flex-1 py-2.5 px-3 text-center transition ${
                    heroTab === 'matching'
                      ? 'bg-white text-signature font-bold border-b-2 border-signature'
                      : 'text-textSecondary hover:text-carbon'
                  }`}
                >
                  Vector Match
                </button>
                <button
                  onClick={() => setHeroTab('rewrite')}
                  className={`flex-1 py-2.5 px-3 text-center transition ${
                    heroTab === 'rewrite'
                      ? 'bg-white text-signature font-bold border-b-2 border-signature'
                      : 'text-textSecondary hover:text-carbon'
                  }`}
                >
                  X-Y-Z Rewrite
                </button>
                <button
                  onClick={() => setHeroTab('interview')}
                  className={`flex-1 py-2.5 px-3 text-center transition ${
                    heroTab === 'interview'
                      ? 'bg-white text-signature font-bold border-b-2 border-signature'
                      : 'text-textSecondary hover:text-carbon'
                  }`}
                >
                  STAR Coach
                </button>
              </div>

              {/* Tab 1: ATS Scorecard Preview */}
              {heroTab === 'scorecard' && (
                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-textMuted uppercase font-bold tracking-wider">Candidate Scorecard</span>
                      <h4 className="font-headline font-bold text-sm text-carbon">Software Engineer Benchmark</h4>
                    </div>
                    <Badge variant="success">Strong Readiness</Badge>
                  </div>

                  <div className="flex justify-center py-1">
                    <ScoreGauge score={86} maxScore={100} size={135} sublabel="86 / 100 Deterministic ATS Points" />
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-textSecondary">Formatting & Structure</span>
                        <span className="font-bold text-carbon">19 / 20</span>
                      </div>
                      <div className="w-full bg-neutralLight h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full w-[95%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-textSecondary">Keyword Relevance (pgvector)</span>
                        <span className="font-bold text-carbon">22 / 25</span>
                      </div>
                      <div className="w-full bg-neutralLight h-2 rounded-full overflow-hidden">
                        <div className="bg-signature h-full w-[88%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-textSecondary">Google X-Y-Z Impact Density</span>
                        <span className="font-bold text-carbon">18 / 20</span>
                      </div>
                      <div className="w-full bg-neutralLight h-2 rounded-full overflow-hidden">
                        <div className="bg-signature h-full w-[90%]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-standard bg-peach/40 border border-orange-200 text-[11px] text-burnt">
                    <strong>ATS Diagnosis:</strong> Section headings parsed flawlessly. 3 project bullets strengthened with quantified metrics.
                  </div>
                </div>
              )}

              {/* Tab 2: Semantic Matching Preview */}
              {heroTab === 'matching' && (
                <div className="p-6 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-borderStandard">
                    <div>
                      <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Target Job Analysis</span>
                      <p className="font-headline font-bold text-sm text-carbon">Senior Full Stack Engineer • Stripe</p>
                    </div>
                    <div className="text-right">
                      <span className="font-headline font-extrabold text-2xl text-signature">89%</span>
                      <span className="block text-[10px] text-textMuted font-semibold">Semantic Match</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-carbon block mb-1">Cosine Embedding Distance: 0.12 (High Overlap)</span>
                      <div className="w-full bg-neutralLight h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full w-[89%]" />
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-carbon block mb-1.5">Direct Verified Competencies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Python', 'React 18', 'PostgreSQL', 'Docker', 'REST APIs', 'TypeScript'].map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-carbon block mb-1.5">Surfaced Growth Gaps:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Apache Kafka', 'Distributed Tracing'].map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium text-[10px] flex items-center gap-1">
                            <X className="w-3 h-3 text-red-500" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutralLight/40 rounded-standard border border-borderStandard text-[11px] text-textSecondary">
                    <strong>Embeddings Insight:</strong> Dense sentence embeddings detected transferable message queue knowledge from Celery experience.
                  </div>
                </div>
              )}

              {/* Tab 3: X-Y-Z Rewrite Preview */}
              {heroTab === 'rewrite' && (
                <div className="p-6 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-borderStandard">
                    <span className="text-xs font-bold text-carbon">Google X-Y-Z Bullet Optimizer</span>
                    <Badge variant="orange">+18 ATS Impact</Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-standard bg-red-50/60 border border-red-200 space-y-1">
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                        <X className="w-3 h-3" /> Original Candidate Draft
                      </span>
                      <p className="text-textSecondary italic">
                        "Responsible for maintaining backend systems and writing code to speed up our queries."
                      </p>
                    </div>

                    <div className="p-3 rounded-standard bg-emerald-50/70 border border-emerald-300 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Verified Google X-Y-Z Structure
                      </span>
                      <p className="text-carbon font-medium">
                        "Optimized distributed PostgreSQL schemas with indexed query caching, decreasing p95 latency by 42% across 1.8M daily user requests."
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-peach/40 border border-orange-200 text-[10px] text-burnt">
                    <strong>Formula Breakdown:</strong> Accomplished [42% latency cut] measured by [1.8M requests] by doing [PostgreSQL indexing & caching].
                  </div>
                </div>
              )}

              {/* Tab 4: STAR Interview Coach Preview */}
              {heroTab === 'interview' && (
                <div className="p-6 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-borderStandard">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-signature" />
                      <span className="text-xs font-bold text-carbon">RAG Interview Simulation</span>
                    </div>
                    <Badge variant="success">STAR Rating: 9.1 / 10</Badge>
                  </div>

                  <div className="p-3 rounded-standard bg-neutralLight/40 border border-borderStandard text-xs space-y-1">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Technical Behavioral Prompt</span>
                    <p className="text-carbon font-semibold">
                      "Describe how you handled an unexpected production outage or database lock bottleneck."
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-neutralLight/50 border border-borderStandard">
                      <span className="text-[10px] text-textMuted font-bold block">Situation</span>
                      <span className="font-extrabold text-carbon">9 / 10</span>
                    </div>
                    <div className="p-2 rounded bg-neutralLight/50 border border-borderStandard">
                      <span className="text-[10px] text-textMuted font-bold block">Task</span>
                      <span className="font-extrabold text-carbon">8 / 10</span>
                    </div>
                    <div className="p-2 rounded bg-neutralLight/50 border border-borderStandard">
                      <span className="text-[10px] text-textMuted font-bold block">Action</span>
                      <span className="font-extrabold text-emerald-700">10 / 10</span>
                    </div>
                    <div className="p-2 rounded bg-neutralLight/50 border border-borderStandard">
                      <span className="text-[10px] text-textMuted font-bold block">Result</span>
                      <span className="font-extrabold text-carbon">9 / 10</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-textSecondary italic">
                    "AI Coach: Excellent technical precision explaining connection pooling failover. Consider tightening the initial situation context by 15 seconds."
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Real-World Metrics Bar */}
      <section className="bg-carbon text-white py-10 border-y border-graphite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="font-headline font-extrabold text-3xl sm:text-4xl text-signature">100 / 100</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-textDisabled">Deterministic Scoring Model</div>
              <p className="text-[11px] text-gray-400">Zero opaque percentages</p>
            </div>
            <div className="space-y-1">
              <div className="font-headline font-extrabold text-3xl sm:text-4xl text-white">384-Dim</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-textDisabled">pgvector Dense Embeddings</div>
              <p className="text-[11px] text-gray-400">Sentence transformer cosine matching</p>
            </div>
            <div className="space-y-1">
              <div className="font-headline font-extrabold text-3xl sm:text-4xl text-signature">STAR</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-textDisabled">Interview Evaluation Rubric</div>
              <p className="text-[11px] text-gray-400">Situation, Task, Action, Result</p>
            </div>
            <div className="space-y-1">
              <div className="font-headline font-extrabold text-3xl sm:text-4xl text-white">100% Free</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-textDisabled">Open Academic Platform</div>
              <p className="text-[11px] text-gray-400">Complete unrestricted intelligence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Bullet Point Optimizer Sandbox */}
      <section id="sandbox" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <Badge variant="orange">Interactive Sandbox</Badge>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-carbon">
            Test The Google X-Y-Z Optimizer
          </h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            Experience how our deterministic rewrites transform vague duties into high-impact, quantifiable achievements preferred by top technical recruiters.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto border-borderStrong shadow-lg bg-white space-y-6">
          {/* Sample Selectors */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-carbon">Select a realistic sample bullet to test:</span>
            <div className="flex flex-wrap gap-2">
              {sampleBullets.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(idx)}
                  className={`px-3 py-1.5 rounded-btn text-xs font-medium transition ${
                    selectedSampleIndex === idx && !customBullet
                      ? 'bg-carbon text-white shadow-sm'
                      : 'bg-neutralLight text-textSecondary hover:bg-neutralLight/80'
                  }`}
                >
                  {sample.role}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <form onSubmit={handleOptimizeCustom} className="space-y-3">
            <div className="relative">
              <textarea
                value={customBullet}
                onChange={(e) => setCustomBullet(e.target.value)}
                placeholder="Or paste your own resume bullet to optimize (e.g. 'Helped develop payment features on our web app')..."
                className="w-full text-xs p-3 rounded-btn border border-borderStandard focus:border-signature focus:ring-1 focus:ring-signature focus:outline-none min-h-[75px]"
              />
            </div>
            {customBullet && (
              <Button type="submit" variant="primary" size="sm" loading={isOptimizing}>
                Optimize My Bullet
              </Button>
            )}
          </form>

          {/* Comparison Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-borderStandard">
            <div className="p-4 rounded-standard bg-red-50/50 border border-red-200 space-y-2">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Weak / Unquantified Draft
              </span>
              <p className="text-xs text-textSecondary leading-relaxed italic">
                "{sandboxResult.original}"
              </p>
              <span className="inline-block text-[10px] text-red-600 font-medium">
                Issue: Lacks measurable scope, specific technologies, and quantifiable business outcomes.
              </span>
            </div>

            <div className="p-4 rounded-standard bg-emerald-50/60 border border-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Google X-Y-Z Transformation
                </span>
                <Badge variant="success" size="sm">{sandboxResult.impact}</Badge>
              </div>
              <p className="text-xs text-carbon font-medium leading-relaxed">
                "{sandboxResult.optimized}"
              </p>
              <div className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-emerald-200">
                Formula Evidence: {sandboxResult.metric}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Primary Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="orange">Full Platform Architecture</Badge>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-carbon">
            7 Integrated Career Intelligence Modules
          </h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            Every module operates on a single unified candidate knowledge base, from PDF parsing to technical interview practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Deterministic ATS Readiness</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Objective 100-point scoring model assessing section completeness, typography consistency, action verb density, and ATS layout parseability.
            </p>
          </Card>

          <Card className="space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">pgvector Semantic Job Matching</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Computes dense 384-dimensional cosine similarity against target postings to surface verified, partial, and missing competencies.
            </p>
          </Card>

          <Card className="space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Explainable Skill Gap Analysis</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Identifies missing critical qualifications and clearly separates explicit resume evidence from implicit industry requirements.
            </p>
          </Card>

          <Card className="space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Milestone Learning Roadmaps</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Converts discovered skill gaps into organized milestone learning tasks with estimated study hours, curated documentation, and coding projects.
            </p>
          </Card>

          <Card className="space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Voice RAG Mock Interviews</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Practice role-specific technical and behavioral questions using native browser voice recognition, evaluated against rigorous STAR criteria.
            </p>
          </Card>

          <Card className="space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Kanban Pipeline & Analytics</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Track job opportunities across 7 stages with salary metrics, interview deadlines, notes, and historical score revision trends.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16 border-y border-borderStandard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge variant="carbon">System Workflow</Badge>
            <h2 className="font-headline font-extrabold text-3xl text-carbon">How CareerFit AI Works</h2>
            <p className="text-sm text-textSecondary">Four disciplined engineering steps to candidate readiness.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <span className="font-headline font-black text-3xl text-signature">01</span>
              <h4 className="font-headline font-bold text-base text-carbon">Upload & Extract</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Securely upload your PDF or DOCX resume. NLP algorithms extract sections, contact data, and skills into structured JSON.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-headline font-black text-3xl text-signature">02</span>
              <h4 className="font-headline font-bold text-base text-carbon">Deterministic ATS Scoring</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Receive an objective 100-point score across 5 categories with Google X-Y-Z bullet rewrites and privacy disclosures.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-headline font-black text-3xl text-signature">03</span>
              <h4 className="font-headline font-bold text-base text-carbon">Match & Bridge Gaps</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Compare your profile with target job descriptions using dense sentence embeddings to reveal exact missing competencies.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-headline font-black text-3xl text-signature">04</span>
              <h4 className="font-headline font-bold text-base text-carbon">Prepare & Apply</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Complete mock interviews with AI evaluation, follow your customized skill roadmap, and track applications in your Kanban board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Legacy ATS Checkers vs CareerFit AI */}
      <section id="comparison" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="carbon">Analytical Integrity</Badge>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-carbon">
            Why CareerFit AI Is Different
          </h2>
          <p className="text-sm text-textSecondary">
            Engineered for genuine student and engineer career growth — without black-box percentages or paywalls.
          </p>
        </div>

        <Card padded={false} className="overflow-hidden border-borderStrong shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-carbon text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6">Evaluation Dimension</th>
                  <th className="py-4 px-6 text-gray-400">Legacy ATS Checkers</th>
                  <th className="py-4 px-6 text-signature">CareerFit AI Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderStandard bg-white">
                <tr>
                  <td className="py-4 px-6 font-bold text-carbon">Scoring Methodology</td>
                  <td className="py-4 px-6 text-textMuted">Opaque percentage score with no mathematical breakdown</td>
                  <td className="py-4 px-6 font-semibold text-carbon bg-peach/20">
                    Deterministic 100-Point Rubric across 5 transparent categories
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-carbon">Job Matching Algorithm</td>
                  <td className="py-4 px-6 text-textMuted">Brittle keyword counting (punishes synonyms and phrasing)</td>
                  <td className="py-4 px-6 font-semibold text-carbon bg-peach/20">
                    384-dimensional dense sentence embeddings (pgvector cosine similarity)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-carbon">Bullet Point Improvement</td>
                  <td className="py-4 px-6 text-textMuted">Generic tips or hallucinated claims that harm credibility</td>
                  <td className="py-4 px-6 font-semibold text-carbon bg-peach/20">
                    Strict Google X-Y-Z accomplishment syntax with verification flags
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-carbon">Interview Preparation</td>
                  <td className="py-4 px-6 text-textMuted">Static lists of generic questions with no feedback</td>
                  <td className="py-4 px-6 font-semibold text-carbon bg-peach/20">
                    RAG-driven mock technical interviews scored on STAR criteria
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-carbon">Access & Pricing</td>
                  <td className="py-4 px-6 text-textMuted">Gated paywalls ($29 - $49/mo), blurred insights, locked features</td>
                  <td className="py-4 px-6 font-semibold text-emerald-800 bg-peach/20">
                    100% Free & Open Access for all candidates and students
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Candidate Impact Case Studies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="orange">Verified Outcomes</Badge>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-carbon">
            Real Candidate Transformations
          </h2>
          <p className="text-sm text-textSecondary">
            Documented score improvements and career transitions powered by CareerFit AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-carbon">Alex C. • CS Graduate</span>
                <Badge variant="success">Hired @ FinTech</Badge>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="text-center">
                  <span className="text-[10px] text-textMuted uppercase font-bold">Initial ATS</span>
                  <div className="font-headline font-extrabold text-xl text-red-600">58 / 100</div>
                </div>
                <ArrowRight className="w-4 h-4 text-textMuted" />
                <div className="text-center">
                  <span className="text-[10px] text-textMuted uppercase font-bold">Final ATS</span>
                  <div className="font-headline font-extrabold text-xl text-emerald-600">88 / 100</div>
                </div>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed italic">
                "The Google X-Y-Z rewrites turned my vague college projects into quantifiable engineering feats. I landed 4 first-round technical screens within two weeks."
              </p>
            </div>
            <span className="text-[11px] text-textMuted border-t border-borderStandard pt-3 block">
              Role: Junior Full Stack Engineer
            </span>
          </Card>

          <Card className="space-y-4 flex flex-col justify-between border-signature/40 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-carbon">Maya P. • Career Switcher</span>
                <Badge variant="success">Hired @ Cloud SaaS</Badge>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="text-center">
                  <span className="text-[10px] text-textMuted uppercase font-bold">Job Match</span>
                  <div className="font-headline font-extrabold text-xl text-amber-600">61%</div>
                </div>
                <ArrowRight className="w-4 h-4 text-textMuted" />
                <div className="text-center">
                  <span className="text-[10px] text-textMuted uppercase font-bold">After Roadmap</span>
                  <div className="font-headline font-extrabold text-xl text-emerald-600">92%</div>
                </div>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed italic">
                "The personalized Docker and PostgreSQL roadmap showed me exactly what was holding my profile back. The roadmap tasks gave me direct portfolio project evidence."
              </p>
            </div>
            <span className="text-[11px] text-textMuted border-t border-borderStandard pt-3 block">
              Role: Backend Systems Developer
            </span>
          </Card>

          <Card className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-carbon">Liam W. • Self-Taught Dev</span>
                <Badge variant="success">Offer Accepted</Badge>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="text-center">
                  <span className="text-[10px] text-textMuted uppercase font-bold">STAR Score</span>
                  <div className="font-headline font-extrabold text-xl text-amber-600">6.2 / 10</div>
                </div>
                <ArrowRight className="w-4 h-4 text-textMuted" />
                <div className="text-center">
                  <span className="text-[10px] text-textMuted uppercase font-bold">Practiced</span>
                  <div className="font-headline font-extrabold text-xl text-emerald-600">9.4 / 10</div>
                </div>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed italic">
                "The voice-enabled STAR interview coach pointed out that I kept rambling on the 'Task' and under-explaining my 'Result'. Fixed my pacing immediately."
              </p>
            </div>
            <span className="text-[11px] text-textMuted border-t border-borderStandard pt-3 block">
              Role: Frontend Engineer
            </span>
          </Card>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-12 space-y-3">
          <Badge variant="carbon">Frequently Asked Questions</Badge>
          <h2 className="font-headline font-extrabold text-3xl text-carbon">Clear, Transparent Answers</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} padded={false} className="overflow-hidden">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutralLight/40 transition"
                aria-expanded={openFaq === i}
              >
                <span className="font-headline font-bold text-sm text-carbon">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-textMuted transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 pt-1 text-xs text-textSecondary leading-relaxed border-t border-borderStandard bg-ivory/30">
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-carbon text-white rounded-standard p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-white">
              Ready To Optimize Your Career Trajectory?
            </h2>
            <p className="text-xs sm:text-sm text-textDisabled leading-relaxed">
              Join candidates leveraging deterministic ATS evaluation, dense semantic job matching, and RAG mock interviews. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link to="/signup">
              <Button variant="primary" size="lg">
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Candidate Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
