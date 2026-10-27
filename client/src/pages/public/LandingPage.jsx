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
  Layers
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the ATS readiness score work?",
      a: "Our scoring engine runs an objective, 100-point deterministic evaluation across 5 critical dimensions: Formatting & Structure (20 pts), Keyword Relevance (25 pts), Content Quality & Impact (20 pts), Skill Depth (20 pts), and ATS File Compatibility (15 pts). We clearly disclose every category breakdown rather than outputting a black-box percentage."
    },
    {
      q: "Does semantic job matching just look for exact keywords?",
      a: "No. In addition to alias and token matching via RapidFuzz, we use 384-dimensional dense sentence embeddings to calculate cosine semantic similarity between your experience bullet points and the requirements stated in the job posting."
    },
    {
      q: "Does the AI rewrite fabricate metrics or qualifications?",
      a: "Never. All AI bullet-point rewrites strictly follow Google's X-Y-Z accomplishment structure ('Accomplished [X] measured by [Y] by doing [Z]'). If an estimated metric or placeholder is suggested, it is explicitly flagged with 'Requires Confirmation' so you verify factual accuracy before accepting."
    },
    {
      q: "How does the RAG mock interview preparation work?",
      a: "The mock interview generator ingests your target role, resume, and specific job description into a vector knowledge store, generating relevant technical problem challenges and behavioral questions evaluated against standard STAR rubrics."
    },
    {
      q: "Is my personal resume information private?",
      a: "Yes. All resumes are stored securely with Row Level Security (RLS) policies. We do not sell candidate data, and our parsing engine flags sensitive personal details like full street addresses to advise you on modern data hygiene."
    }
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-peach border border-orange-200 text-burnt text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-signature" />
              <span>Full-Stack AI/ML Career Intelligence Platform</span>
            </div>

            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-carbon tracking-tight leading-[1.1]">
              Build Your Career <br className="hidden sm:inline" />
              <span className="text-signature underline decoration-peach decoration-wavy underline-offset-8">
                With Clarity.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-textSecondary max-w-xl leading-relaxed">
              Eliminate guesswork from your job search. Evaluate your resume against automated ATS standards, match role requirements with semantic embeddings, bridge skill gaps with structured roadmaps, and practice mock technical interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-textMuted font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-semanticSuccess" />
                <span>Deterministic 100-Point Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-semanticSuccess" />
                <span>pgvector Semantic Matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-semanticSuccess" />
                <span>RAG Interview Coach</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product UI Preview */}
          <div className="lg:col-span-5">
            <Card className="border-borderStrong shadow-xl bg-white relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-borderStandard">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs font-semibold text-textMuted ml-2">Assessment Live Report</span>
                </div>
                <Badge variant="success">Strong Readiness</Badge>
              </div>

              <div className="py-6 flex flex-col items-center">
                <ScoreGauge score={84} maxScore={100} size={150} sublabel="84% ATS Compatibility" />
              </div>

              <div className="space-y-3 pt-2 border-t border-borderStandard">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-textSecondary">Keyword Relevance</span>
                  <span className="font-bold text-carbon">22 / 25 pts</span>
                </div>
                <div className="w-full bg-neutralLight h-2 rounded-full overflow-hidden">
                  <div className="bg-signature h-full w-[88%]" />
                </div>

                <div className="flex justify-between text-xs">
                  <span className="font-medium text-textSecondary">Content & Google X-Y-Z Impact</span>
                  <span className="font-bold text-carbon">18 / 20 pts</span>
                </div>
                <div className="w-full bg-neutralLight h-2 rounded-full overflow-hidden">
                  <div className="bg-signature h-full w-[90%]" />
                </div>

                <div className="p-3 bg-peach/40 rounded-standard border border-orange-100 text-[11px] text-burnt mt-4">
                  <strong>AI Suggestion:</strong> Added quantifiable metric to project bullet: "Architected distributed pipeline, reducing latency by 35%."
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Primary Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="orange">Integrated Career Intelligence</Badge>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-carbon">
            Engineered For Every Stage Of Your Job Search
          </h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            From initial document parsing to executive interview answers, each module operates on a unified candidate knowledge base.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="space-y-4">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">ATS Resume Readiness Scoring</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Objective 100-point scoring model assessing section completeness, typography consistency, action verb density, and layout parseability.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Semantic Job Matching</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Paste any job description to compute dense vector cosine similarity against your resume sections. Surfaces matched, partial, and missing skills.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Explainable Skill Gap Analysis</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Identifies missing critical skills required by your target roles and categorizes explicit evidence versus inferred requirements.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Personalized Learning Roadmaps</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Converts identified skill deficits into structured milestone tasks with estimated study hours, curated documentation links, and practical portfolio exercises.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">RAG Mock Interviews</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Practice role-specific technical and behavioral questions. Answers are evaluated for technical depth, clarity, and STAR-method alignment with voice recognition.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="w-10 h-10 rounded-btn bg-peach text-burnt flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-lg text-carbon">Job Tracker & Analytics</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Organize your pipeline across 8 visual stages with follow-up deadlines, application notes, and persistent historical score trends.
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
            <p className="text-sm text-textSecondary">Four disciplined steps to candidate readiness.</p>
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
              <h4 className="font-headline font-bold text-base text-carbon">ATS Scoring</h4>
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

      {/* Transparent Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="orange">Transparent Access</Badge>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-carbon">
            Plans For Every Career Stage
          </h2>
          <p className="text-sm text-textSecondary">
            Honest tier structure. No hidden fees or automated credit card billing locks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-textMuted">Free Tier</span>
              <div className="font-headline font-extrabold text-3xl text-carbon">$0</div>
              <p className="text-xs text-textSecondary">Essential tools for students and initial resume health checks.</p>
              <ul className="space-y-2 text-xs text-textSecondary pt-4 border-t border-borderStandard">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> 3 Resume ATS Assessments</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Basic Keyword Gap Analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Kanban Application Tracker</li>
              </ul>
            </div>
            <div className="pt-8">
              <Link to="/signup" className="w-full">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between border-signature ring-2 ring-signature relative shadow-lg">
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <Badge variant="orange">Most Popular</Badge>
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-burnt">Pro Intelligence</span>
              <div className="font-headline font-extrabold text-3xl text-carbon">$19 <span className="text-xs font-normal text-textMuted">/ month</span></div>
              <p className="text-xs text-textSecondary">Comprehensive intelligence for active job seekers and career switchers.</p>
              <ul className="space-y-2 text-xs text-textSecondary pt-4 border-t border-borderStandard">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Unlimited ATS Scoring & Rewrites</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Semantic pgvector Job Matching</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Personalized Learning Roadmaps</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> 20 AI Mock Interviews & Voice Prep</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Downloadable PDF Reports</li>
              </ul>
            </div>
            <div className="pt-8">
              <Link to="/signup" className="w-full">
                <Button variant="primary" className="w-full">Start Pro Trial</Button>
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-textMuted">University & Enterprise</span>
              <div className="font-headline font-extrabold text-3xl text-carbon">Custom</div>
              <p className="text-xs text-textSecondary">For campus career centers and talent mentorship organizations.</p>
              <ul className="space-y-2 text-xs text-textSecondary pt-4 border-t border-borderStandard">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Multi-cohort Administrator Portal</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Custom Skill Taxonomy Ingestion</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signature" /> Batch Assessment Processing</li>
              </ul>
            </div>
            <div className="pt-8">
              <Link to="/signup" className="w-full">
                <Button variant="outline" className="w-full">Contact Advisor</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <Badge variant="carbon">Frequently Asked Questions</Badge>
          <h2 className="font-headline font-extrabold text-3xl text-carbon">Clear Answers</h2>
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
    </div>
  );
}
