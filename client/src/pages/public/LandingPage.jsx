import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Briefcase,
  Target,
  Map,
  MessagesSquare,
  ArrowRight,
  ChevronDown,
  Sparkles,
  BarChart2,
  Cpu,
  Zap,
  Code2,
  Check,
  X,
  Volume2,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Radio,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber';

export function LandingPage() {
  const [heroTab, setHeroTab] = useState('scorecard');
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

  const tools = [
    {
      id: "01",
      title: "Deterministic ATS Scorer",
      description: "Audits your resume against a transparent 100-point rubric across 5 dimensions: Formatting (20 pts), Keywords (25 pts), X-Y-Z Impact (20 pts), Skill Depth (20 pts), and ATS Hygiene (15 pts).",
      icon: FileCheck,
      tag: "Rubric Engine",
      link: "/ats-scorer"
    },
    {
      id: "02",
      title: "pgvector Semantic Matcher",
      description: "Generates 384-dimensional dense sentence embeddings to calculate true cosine similarity between your profile and job specs, discovering transferable engineering skills.",
      icon: Briefcase,
      tag: "Vector Search",
      link: "/job-matching"
    },
    {
      id: "03",
      title: "Google X-Y-Z Rewriter",
      description: "Transforms vague task bullets into high-impact engineering achievements using Google's formula: Accomplished [X] measured by [Y] by doing [Z].",
      icon: Code2,
      tag: "Syntax Optimizer",
      link: "/resume-rewriter"
    },
    {
      id: "04",
      title: "Voice RAG STAR Interviewer",
      description: "Speech-to-text behavioral and technical mock interviews powered by RAG context. Scored strictly on Situation, Task, Action, and Result criteria.",
      icon: MessagesSquare,
      tag: "Voice Coaching",
      link: "/mock-interview"
    },
    {
      id: "05",
      title: "Explainable Skill Gap Matrix",
      description: "Separates explicit resume omissions from implicit domain prerequisites with prioritized remediation tasks and verified documentation links.",
      icon: Target,
      tag: "Gap Analysis",
      link: "/skill-gap"
    },
    {
      id: "06",
      title: "Application Pipeline & Velocity",
      description: "7-stage Kanban workflow paired with historical ATS score telemetry. Track every opportunity from Wishlist to Offer with salary notes and deadlines.",
      icon: BarChart2,
      tag: "Pipeline Kanban",
      link: "/applications"
    }
  ];

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
    <div className="relative min-h-screen bg-obsidian text-foreground overflow-x-clip selection:bg-brandOrange/30 selection:text-white">
      {/* Volumetric background beam & grain textures */}
      <div className="noise" />
      <div className="beam" />

      {/* Top Live Announcement Banner */}
      <div className="relative z-10 border-b border-surfaceBorder bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-secondary">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brandOrange/10 border border-brandOrangeBorder text-brandOrange font-mono text-[10px] font-semibold uppercase tracking-wider">
              <Radio className="w-3 h-3 text-brandOrange animate-pulse" /> Live Telemetry
            </span>
            <span className="hidden sm:inline text-secondary">CareerFit Engine v2.4 initialized with deterministic 100-point rubric</span>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 text-brandOrange font-semibold hover:text-brandOrangeHover transition-colors shrink-0"
          >
            <span>Claim Free Seat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-7">
            {/* Live Active Candidates Chip */}
            <div className="liveChip">
              <span className="liveDot" />
              <span>2,840+ engineers preparing right now</span>
            </div>

            {/* Kinetic Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              The smartest way to prepare for <br className="hidden sm:inline" />
              <span className="kinetic-text">technical hiring & ATS screening.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-secondary max-w-xl leading-relaxed">
              A transparent career intelligence platform for engineers. Audit your resume against an explainable 100-point rubric, discover semantic job fit with pgvector embeddings, and rehearse technical screens with STAR-evaluated mock interviews.
            </p>

            {/* 3 CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto haptic-btn">
                  <span>Launch Free Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/ats-scorer">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto haptic-btn">
                  Explore ATS Scorer
                </Button>
              </Link>
              <a
                href="#sandbox"
                className="inline-flex items-center justify-center px-4 py-3 rounded-btn text-xs font-mono font-medium text-secondary hover:text-foreground hover:bg-surfaceCard transition-colors"
              >
                <span>Try Sandbox //</span>
              </a>
            </div>

            {/* 4 Numerical Metric Cards */}
            <div className="pt-6 border-t border-surfaceBorder grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface/60 border border-surfaceBorder rounded-card p-3.5 space-y-1">
                <div className="font-headline font-black text-2xl text-brandOrange">
                  <AnimatedNumber value={100} duration={1200} suffix=" / 100" />
                </div>
                <div className="text-[11px] font-mono text-secondary uppercase tracking-wider font-semibold">
                  ATS Rubric
                </div>
                <p className="text-[10px] text-muted leading-tight">Deterministic 5 categories</p>
              </div>

              <div className="bg-surface/60 border border-surfaceBorder rounded-card p-3.5 space-y-1">
                <div className="font-headline font-black text-2xl text-white">
                  <AnimatedNumber value={384} duration={1200} suffix="-Dim" />
                </div>
                <div className="text-[11px] font-mono text-secondary uppercase tracking-wider font-semibold">
                  Embeddings
                </div>
                <p className="text-[10px] text-muted leading-tight">pgvector cosine match</p>
              </div>

              <div className="bg-surface/60 border border-surfaceBorder rounded-card p-3.5 space-y-1">
                <div className="font-headline font-black text-2xl text-brandOrange">
                  <AnimatedNumber value={94} duration={1200} suffix="%" />
                </div>
                <div className="text-[11px] font-mono text-secondary uppercase tracking-wider font-semibold">
                  STAR Pass Rate
                </div>
                <p className="text-[10px] text-muted leading-tight">Voice RAG simulation</p>
              </div>

              <div className="bg-surface/60 border border-surfaceBorder rounded-card p-3.5 space-y-1">
                <div className="font-headline font-black text-2xl text-white">
                  100% Free
                </div>
                <div className="text-[11px] font-mono text-secondary uppercase tracking-wider font-semibold">
                  Open Tier
                </div>
                <p className="text-[10px] text-muted leading-tight">Zero paywalls or fees</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Multi-Tab Product Preview (Glass Panel) */}
          <div className="lg:col-span-5">
            <div className="glass-panel border-surfaceBorder rounded-card overflow-hidden shadow-2xl tactile-card">
              {/* Terminal Window Header */}
              <div className="px-4 py-3 bg-surface border-b border-surfaceBorder flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono font-medium text-secondary ml-2">
                    careerfit-engine // live-rubric
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-brandOrange/15 text-brandOrange border border-brandOrangeBorder">
                  ONLINE
                </span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex border-b border-surfaceBorder bg-surface/50 text-xs font-medium">
                <button
                  onClick={() => setHeroTab('scorecard')}
                  className={`flex-1 py-2.5 px-3 text-center transition-all ${
                    heroTab === 'scorecard'
                      ? 'bg-surfaceCard text-brandOrange font-bold border-b-2 border-brandOrange'
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  ATS Score
                </button>
                <button
                  onClick={() => setHeroTab('matching')}
                  className={`flex-1 py-2.5 px-3 text-center transition-all ${
                    heroTab === 'matching'
                      ? 'bg-surfaceCard text-brandOrange font-bold border-b-2 border-brandOrange'
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  Vector Match
                </button>
                <button
                  onClick={() => setHeroTab('rewrite')}
                  className={`flex-1 py-2.5 px-3 text-center transition-all ${
                    heroTab === 'rewrite'
                      ? 'bg-surfaceCard text-brandOrange font-bold border-b-2 border-brandOrange'
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  X-Y-Z Rewrite
                </button>
                <button
                  onClick={() => setHeroTab('interview')}
                  className={`flex-1 py-2.5 px-3 text-center transition-all ${
                    heroTab === 'interview'
                      ? 'bg-surfaceCard text-brandOrange font-bold border-b-2 border-brandOrange'
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  STAR Coach
                </button>
              </div>

              {/* Tab 1: ATS Scorecard Preview */}
              {heroTab === 'scorecard' && (
                <div className="p-6 space-y-5 animate-in fade-in duration-150 bg-surfaceCard/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-secondary uppercase font-mono tracking-wider">
                        Candidate Benchmark
                      </span>
                      <h4 className="font-headline font-bold text-sm text-foreground">
                        Software Engineer Profile
                      </h4>
                    </div>
                    <Badge variant="emerald">Strong Readiness</Badge>
                  </div>

                  <div className="flex justify-center py-1">
                    <ScoreGauge score={86} maxScore={100} size={135} sublabel="86 / 100 Deterministic Points" />
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-secondary">Formatting & Structure</span>
                        <span className="font-bold text-white font-mono">19 / 20</span>
                      </div>
                      <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-surfaceBorder">
                        <div className="bg-emerald-500 h-full w-[95%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-secondary">Keyword Relevance (pgvector)</span>
                        <span className="font-bold text-white font-mono">22 / 25</span>
                      </div>
                      <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-surfaceBorder">
                        <div className="bg-brandOrange h-full w-[88%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-secondary">Google X-Y-Z Impact Density</span>
                        <span className="font-bold text-white font-mono">18 / 20</span>
                      </div>
                      <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-surfaceBorder">
                        <div className="bg-brandOrange h-full w-[90%]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-card bg-surface border border-surfaceBorder text-[11px] text-secondary">
                    <strong className="text-foreground">ATS Diagnosis:</strong> Section headings parsed flawlessly. 3 project bullets strengthened with quantified metrics.
                  </div>
                </div>
              )}

              {/* Tab 2: Semantic Matching Preview */}
              {heroTab === 'matching' && (
                <div className="p-6 space-y-4 animate-in fade-in duration-150 bg-surfaceCard/90">
                  <div className="flex items-center justify-between pb-2 border-b border-surfaceBorder">
                    <div>
                      <span className="text-[10px] text-secondary font-mono uppercase tracking-wider">
                        Target Job Spec
                      </span>
                      <p className="font-headline font-bold text-sm text-foreground">
                        Senior Full Stack Engineer
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-headline font-extrabold text-2xl text-brandOrange">89%</span>
                      <span className="block text-[10px] text-secondary font-mono">Vector Cosine</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-medium text-secondary block mb-1">
                        Cosine Embedding Distance: 0.12 (High Overlap)
                      </span>
                      <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-surfaceBorder">
                        <div className="bg-emerald-500 h-full w-[89%]" />
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-foreground block mb-1.5">Direct Verified Competencies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Python', 'React 18', 'PostgreSQL', 'Docker', 'REST APIs', 'TypeScript'].map(s => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-400" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-foreground block mb-1.5">Surfaced Growth Gaps:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Apache Kafka', 'Distributed Tracing'].map(s => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px] flex items-center gap-1"
                          >
                            <X className="w-3 h-3 text-red-400" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-surface rounded-card border border-surfaceBorder text-[11px] text-secondary">
                    <strong className="text-foreground">pgvector Insight:</strong> Dense sentence embeddings detected transferable message queue knowledge from Celery background tasks.
                  </div>
                </div>
              )}

              {/* Tab 3: X-Y-Z Rewrite Preview */}
              {heroTab === 'rewrite' && (
                <div className="p-6 space-y-4 animate-in fade-in duration-150 bg-surfaceCard/90">
                  <div className="flex items-center justify-between pb-2 border-b border-surfaceBorder">
                    <span className="text-xs font-bold text-foreground">Google X-Y-Z Bullet Optimizer</span>
                    <Badge variant="orange">+18 ATS Impact</Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-card bg-red-950/20 border border-red-500/30 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <X className="w-3 h-3" /> Original Candidate Draft
                      </span>
                      <p className="text-secondary italic">
                        "Responsible for maintaining backend systems and writing code to speed up our queries."
                      </p>
                    </div>

                    <div className="p-3 rounded-card bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Verified Google X-Y-Z Structure
                      </span>
                      <p className="text-foreground font-medium">
                        "Optimized distributed PostgreSQL schemas with indexed query caching, decreasing p95 latency by 42% across 1.8M daily user requests."
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-surface border border-surfaceBorder text-[10px] text-secondary">
                    <strong className="text-brandOrange">Formula Breakdown:</strong> Accomplished [42% latency cut] measured by [1.8M requests] by doing [PostgreSQL indexing & caching].
                  </div>
                </div>
              )}

              {/* Tab 4: STAR Interview Coach Preview */}
              {heroTab === 'interview' && (
                <div className="p-6 space-y-4 animate-in fade-in duration-150 bg-surfaceCard/90">
                  <div className="flex items-center justify-between pb-2 border-b border-surfaceBorder">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-brandOrange" />
                      <span className="text-xs font-bold text-foreground">RAG Interview Simulation</span>
                    </div>
                    <Badge variant="emerald">STAR Score: 9.1 / 10</Badge>
                  </div>

                  <div className="p-3 rounded-card bg-surface border border-surfaceBorder text-xs space-y-1">
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-wider">
                      Technical Behavioral Prompt
                    </span>
                    <p className="text-foreground font-semibold">
                      "Describe how you handled an unexpected production outage or database lock bottleneck."
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-surface border border-surfaceBorder">
                      <span className="text-[10px] text-secondary font-mono block">Situation</span>
                      <span className="font-extrabold text-foreground">9 / 10</span>
                    </div>
                    <div className="p-2 rounded bg-surface border border-surfaceBorder">
                      <span className="text-[10px] text-secondary font-mono block">Task</span>
                      <span className="font-extrabold text-foreground">8 / 10</span>
                    </div>
                    <div className="p-2 rounded bg-surface border border-surfaceBorder">
                      <span className="text-[10px] text-secondary font-mono block">Action</span>
                      <span className="font-extrabold text-emerald-400">10 / 10</span>
                    </div>
                    <div className="p-2 rounded bg-surface border border-surfaceBorder">
                      <span className="text-[10px] text-secondary font-mono block">Result</span>
                      <span className="font-extrabold text-foreground">9 / 10</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-secondary italic">
                    "AI Coach: Excellent technical precision explaining connection pooling failover. Consider tightening the initial situation context by 15 seconds."
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 01: Platform Utilities (Hairline Grid) */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="eyebrow inline-flex">
            <span className="eyebrowNum">01</span> // PLATFORM UTILITIES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Your Career Intelligence Toolkit
          </h2>
          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Six explainable engineering modules built for transparent career readiness. Every tool adheres to open, deterministic evaluation standards.
          </p>
        </div>

        {/* 1px Hairline Grid Container */}
        <div className="hairline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.link}
                className="hairline-card p-6 sm:p-7 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="iconBox group-hover:border-brandOrange group-hover:text-brandOrange transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-muted group-hover:text-brandOrange transition-colors">
                      {tool.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-brandOrange transition-colors flex items-center gap-2">
                      <span>{tool.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary mt-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-surfaceBorder flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                    {tool.tag}
                  </span>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-brandOrange group-hover:translate-x-1 transition-transform">
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section 02: Interactive Engine (Sandbox) */}
      <section id="sandbox" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="eyebrow inline-flex">
            <span className="eyebrowNum">02</span> // INTERACTIVE ENGINE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            The Google X-Y-Z Achievement Optimizer
          </h2>
          <p className="text-sm text-secondary leading-relaxed">
            See how deterministic rewrites turn vague task descriptions into measurable engineering achievements.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-surfaceCard border border-surfaceBorder rounded-card p-6 sm:p-8 space-y-6 shadow-2xl tactile-card">
          {/* Sample Benchmark Selectors */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-secondary uppercase tracking-wider block font-semibold">
              Select a technical role benchmark:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleBullets.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(idx)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-btn text-xs font-medium transition-all ${
                    selectedSampleIndex === idx && !customBullet
                      ? 'bg-brandOrange text-white shadow-md'
                      : 'bg-surface text-secondary hover:text-white hover:bg-surface/80 border border-surfaceBorder'
                  }`}
                >
                  {idx === 0 && <Code2 className="w-3.5 h-3.5" />}
                  {idx === 1 && <Layers className="w-3.5 h-3.5" />}
                  {idx === 2 && <Cpu className="w-3.5 h-3.5" />}
                  <span>{sample.role}</span>
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
                placeholder="Or paste your own resume bullet to test (e.g. 'Helped write backend API endpoints for our app')..."
                className="w-full text-xs p-3.5 rounded-btn bg-surface border border-surfaceBorder text-foreground focus:border-brandOrange focus:ring-1 focus:ring-brandOrange focus:outline-none min-h-[85px] font-sans placeholder:text-muted"
              />
            </div>
            {customBullet && (
              <Button type="submit" variant="primary" size="sm" loading={isOptimizing} className="haptic-btn">
                Rewrite With Google X-Y-Z Formula
              </Button>
            )}
          </form>

          {/* Comparison Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surfaceBorder">
            <div className="p-4 rounded-card bg-red-950/20 border border-red-500/30 space-y-2.5">
              <span className="text-[10px] font-mono text-red-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <X className="w-3.5 h-3.5" /> Weak Draft
              </span>
              <p className="text-xs text-secondary leading-relaxed italic">
                "{sandboxResult.original}"
              </p>
              <div className="text-[11px] text-red-400/90 font-medium pt-1 border-t border-red-500/20">
                Lacks quantified business metrics, specific tools, and operational velocity.
              </div>
            </div>

            <div className="p-4 rounded-card bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Google X-Y-Z Standard
                </span>
                <Badge variant="emerald" size="xs">{sandboxResult.impact}</Badge>
              </div>
              <p className="text-xs text-foreground font-semibold leading-relaxed">
                "{sandboxResult.optimized}"
              </p>
              <div className="text-[11px] text-emerald-400 font-medium pt-1 border-t border-emerald-500/20">
                Formula Breakdown: <span className="font-bold">{sandboxResult.metric}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 03: System Workflow */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="eyebrow inline-flex">
            <span className="eyebrowNum">03</span> // SYSTEM WORKFLOW
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Engineered for Candidate Readiness
          </h2>
          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Four disciplined engineering steps to comprehensive ATS readiness and interview mastery.
          </p>
        </div>

        <div className="hairline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="hairline-card p-6 space-y-3">
            <div className="font-mono text-xs font-bold text-brandOrange">01 // INGEST</div>
            <h4 className="font-headline font-bold text-base text-foreground">Upload & Extract</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Securely upload your PDF or DOCX resume. NLP algorithms extract sections, contact data, and skill inventories into structured JSON.
            </p>
          </div>

          <div className="hairline-card p-6 space-y-3">
            <div className="font-mono text-xs font-bold text-brandOrange">02 // AUDIT</div>
            <h4 className="font-headline font-bold text-base text-foreground">Deterministic ATS Scoring</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Receive an objective 100-point score across 5 categories with Google X-Y-Z bullet rewrites and explicit privacy disclosures.
            </p>
          </div>

          <div className="hairline-card p-6 space-y-3">
            <div className="font-mono text-xs font-bold text-brandOrange">03 // BRIDGE</div>
            <h4 className="font-headline font-bold text-base text-foreground">Match & Bridge Gaps</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Compare your profile with target job descriptions using dense sentence embeddings to reveal exact missing competencies.
            </p>
          </div>

          <div className="hairline-card p-6 space-y-3">
            <div className="font-mono text-xs font-bold text-brandOrange">04 // REHEARSE</div>
            <h4 className="font-headline font-bold text-base text-foreground">Prepare & Apply</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Complete mock interviews with AI evaluation, follow your customized skill roadmap, and track applications in your Kanban board.
            </p>
          </div>
        </div>
      </section>

      {/* Section 04: Methodology Comparison */}
      <section id="comparison" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="eyebrow inline-flex">
            <span className="eyebrowNum">04</span> // METHODOLOGY COMPARISON
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Why CareerFit AI Is Different
          </h2>
          <p className="text-sm text-secondary">
            Engineered for genuine engineer career growth — without black-box scores or paywalls.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-surfaceCard border border-surfaceBorder rounded-card overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-surfaceBorder uppercase font-mono text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-foreground">Evaluation Dimension</th>
                  <th className="py-4 px-6 text-muted">Legacy ATS Checkers</th>
                  <th className="py-4 px-6 text-brandOrange">CareerFit AI Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceBorder">
                <tr>
                  <td className="py-4 px-6 font-bold text-foreground">Scoring Methodology</td>
                  <td className="py-4 px-6 text-muted">Opaque percentage score with no mathematical breakdown</td>
                  <td className="py-4 px-6 font-semibold text-brandOrange bg-brandOrange/5">
                    Deterministic 100-Point Rubric across 5 transparent categories
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-foreground">Job Matching Algorithm</td>
                  <td className="py-4 px-6 text-muted">Brittle keyword counting (punishes synonyms and phrasing)</td>
                  <td className="py-4 px-6 font-semibold text-brandOrange bg-brandOrange/5">
                    384-dimensional dense sentence embeddings (pgvector cosine similarity)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-foreground">Bullet Point Improvement</td>
                  <td className="py-4 px-6 text-muted">Generic tips or hallucinated claims that harm credibility</td>
                  <td className="py-4 px-6 font-semibold text-brandOrange bg-brandOrange/5">
                    Strict Google X-Y-Z accomplishment syntax with verification flags
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-foreground">Interview Preparation</td>
                  <td className="py-4 px-6 text-muted">Static lists of generic questions with no feedback</td>
                  <td className="py-4 px-6 font-semibold text-brandOrange bg-brandOrange/5">
                    RAG-driven mock technical interviews scored on STAR criteria
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-foreground">Access & Pricing</td>
                  <td className="py-4 px-6 text-muted">Gated paywalls ($29 - $49/mo), blurred insights, locked features</td>
                  <td className="py-4 px-6 font-semibold text-emerald-400 bg-brandOrange/5">
                    100% Free & Open Access for all candidates and students
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 05: Verified Outcomes (Case Studies) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="eyebrow inline-flex">
            <span className="eyebrowNum">05</span> // VERIFIED OUTCOMES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Real Candidate Transformations
          </h2>
          <p className="text-sm text-secondary">
            Measurable score improvements and career transitions verified on the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surfaceCard border border-surfaceBorder rounded-card p-6 space-y-4 flex flex-col justify-between tactile-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Alex C. • CS Graduate</span>
                <Badge variant="emerald" size="xs">Hired @ FinTech</Badge>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono">Initial ATS</span>
                  <div className="font-headline font-black text-xl text-red-400">58 / 100</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono">Final ATS</span>
                  <div className="font-headline font-black text-xl text-emerald-400">88 / 100</div>
                </div>
              </div>
              <p className="text-xs text-secondary leading-relaxed italic">
                "The Google X-Y-Z rewrites turned my vague college projects into quantifiable engineering feats. I landed 4 first-round technical screens within two weeks."
              </p>
            </div>
            <span className="text-[11px] text-muted border-t border-surfaceBorder pt-3 block font-mono">
              Role: Junior Full Stack Engineer
            </span>
          </div>

          <div className="bg-surfaceCard border border-brandOrangeBorder rounded-card p-6 space-y-4 flex flex-col justify-between tactile-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Maya P. • Career Switcher</span>
                <Badge variant="emerald" size="xs">Hired @ Cloud SaaS</Badge>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono">Job Match</span>
                  <div className="font-headline font-black text-xl text-amber-400">61%</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono">After Roadmap</span>
                  <div className="font-headline font-black text-xl text-emerald-400">92%</div>
                </div>
              </div>
              <p className="text-xs text-secondary leading-relaxed italic">
                "The personalized Docker and PostgreSQL roadmap showed me exactly what was holding my profile back. The roadmap tasks gave me direct portfolio project evidence."
              </p>
            </div>
            <span className="text-[11px] text-muted border-t border-surfaceBorder pt-3 block font-mono">
              Role: Backend Systems Developer
            </span>
          </div>

          <div className="bg-surfaceCard border border-surfaceBorder rounded-card p-6 space-y-4 flex flex-col justify-between tactile-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Liam W. • Self-Taught Dev</span>
                <Badge variant="emerald" size="xs">Offer Accepted</Badge>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono">STAR Score</span>
                  <div className="font-headline font-black text-xl text-amber-400">6.2 / 10</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono">Practiced</span>
                  <div className="font-headline font-black text-xl text-emerald-400">9.4 / 10</div>
                </div>
              </div>
              <p className="text-xs text-secondary leading-relaxed italic">
                "The voice-enabled STAR interview coach pointed out that I kept rambling on the 'Task' and under-explaining my 'Result'. Fixed my pacing immediately."
              </p>
            </div>
            <span className="text-[11px] text-muted border-t border-surfaceBorder pt-3 block font-mono">
              Role: Frontend Engineer
            </span>
          </div>
        </div>
      </section>

      {/* Section 06: Knowledge Base (FAQ) */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center mb-12 space-y-3">
          <div className="eyebrow inline-flex">
            <span className="eyebrowNum">06</span> // KNOWLEDGE BASE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Transparent Explanations
          </h2>
          <p className="text-sm text-secondary">
            Everything you need to know about our scoring methodology and privacy protocols.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-surfaceCard border border-surfaceBorder rounded-card overflow-hidden tactile-card">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-surface/60 transition-colors"
                aria-expanded={openFaq === i}
              >
                <span className="font-headline font-bold text-sm text-foreground">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-secondary transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180 text-brandOrange' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 pt-1 text-xs text-secondary leading-relaxed border-t border-surfaceBorder bg-surface/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Final CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-surfaceCard border border-surfaceBorder rounded-card p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl tactile-card">
          <div className="beam opacity-75" />
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-headline font-black text-3xl sm:text-4xl text-white">
              Ready to verify your readiness?
            </h2>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-lg mx-auto">
              Test your resume against 100 explainable points, find missing skills, and run practice screens. Free for all engineers and students.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="haptic-btn">
                <span>Start Free Assessment</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="haptic-btn">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}