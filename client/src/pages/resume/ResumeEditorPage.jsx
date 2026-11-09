import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Save,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  Copy,
  Plus,
  Trash2,
  AlertTriangle,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/apiClient';

const BUZZWORDS = [
  'go-getter', 'team player', 'hardworking', 'detail-oriented',
  'self-starter', 'synergy', 'fast learner', 'think outside the box',
  'rockstar', 'ninja', 'results-driven', 'motivated'
];

const POWER_VERB_ALTERNATIVES = {
  developed: ['architected', 'engineered', 'spearheaded', 'implemented', 'constructed'],
  built: ['orchestrated', 'authored', 'established', 'designed', 'delivered'],
  created: ['pioneered', 'formulated', 'devised', 'instantiated', 'launched'],
  managed: ['directed', 'guided', 'governed', 'administered', 'steered'],
  'worked on': ['contributed to', 'optimized', 'collaborated on', 'refactored'],
  handled: ['executed', 'resolved', 'streamlined', 'dispatched'],
  helped: ['facilitated', 'accelerated', 'partnered on', 'empowered'],
  'responsible for': ['oversaw', 'executed', 'piloted', 'drove']
};

export function ResumeEditorPage() {
  const { resumeId } = useParams();
  const [resume, setResume] = useState(null);
  const [summary, setSummary] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [experience, setExperience] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiRewrites, setAiRewrites] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('rewriter'); // 'rewriter' | 'diagnostics'

  useEffect(() => {
    apiRequest(`/resumes/${resumeId}`).then((data) => {
      const r = data.resume;
      setResume(r);
      const parsed = r.parsed_data || {};
      setSummary(parsed.summary || 'Proactive software engineer dedicated to building resilient distributed systems and web applications.');
      setSkillsText(parsed.skills?.join(', ') || 'Python, JavaScript, React, Node.js, SQL, Git, Docker');
      setExperience(parsed.experience?.length ? parsed.experience : [
        {
          title: 'Software Engineer Intern',
          company: 'Acme Systems',
          bullets: [
            'Built REST APIs for user authentication and transaction processing.',
            'Optimized SQL database queries reducing latency.',
            'Collaborated with senior engineers on frontend components in React.'
          ]
        }
      ]);
    }).catch(console.error);
  }, [resumeId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedParsed = {
        ...(resume.parsed_data || {}),
        summary,
        skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
        experience
      };

      await apiRequest(`/resumes/${resumeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ parsed_data: updatedParsed })
      });

      await apiRequest(`/resumes/${resumeId}/versions`, {
        method: 'POST',
        body: JSON.stringify({
          data: updatedParsed,
          changeSummary: 'Updated sections and bullet points'
        })
      });

      setSaveSuccess(true);
      toast.success('Resume changes saved!');
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      toast.error('Failed to save changes: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAiRewrites = async () => {
    setLoadingAi(true);
    try {
      const bullets = experience.flatMap(e => e.bullets || []);
      const sampleText = bullets.join('\n• ');
      const data = await apiRequest('/assessments', {
        method: 'POST',
        body: JSON.stringify({
          resumeId,
          resumeText: `${summary}\n\nEXPERIENCE\n${sampleText}`,
          targetRole: resume?.target_role || 'Software Engineer'
        })
      });
      setAiRewrites(data.assessment?.bullet_point_rewrites || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const applyRewrite = (rewrite) => {
    let applied = false;
    const updated = experience.map((exp) => {
      if (applied || !exp.bullets) return exp;
      const bIdx = exp.bullets.findIndex(
        (b) => b.trim() === rewrite.original?.trim() || rewrite.original?.includes(b.trim()) || b.includes(rewrite.original?.trim())
      );
      if (bIdx !== -1) {
        applied = true;
        const newBullets = [...exp.bullets];
        newBullets[bIdx] = rewrite.improved;
        return { ...exp, bullets: newBullets };
      }
      return exp;
    });

    if (!applied && experience.length > 0) {
      const firstExp = { ...experience[0] };
      firstExp.bullets = [...(firstExp.bullets || []), rewrite.improved];
      updated[0] = firstExp;
    }

    setExperience(updated);
    setAiRewrites((prev) => prev.filter((r) => r.original !== rewrite.original));
  };

  // Real-time ATS Diagnostics Logic
  const allBullets = experience.flatMap(e => e.bullets || []);
  const allText = `${summary} ${skillsText} ${allBullets.join(' ')}`;

  // 1. Repeated Verbs Check
  const verbCounts = {};
  allBullets.forEach(b => {
    const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord && firstWord.length > 3) {
      verbCounts[firstWord] = (verbCounts[firstWord] || 0) + 1;
    }
  });
  const repeatedVerbs = Object.entries(verbCounts).filter(([_, count]) => count > 2);

  // 2. Metrics check (Google X-Y-Z)
  const bulletsWithoutMetrics = allBullets.filter(b => !/[\d%$\+kKmM]/.test(b));

  // 3. Buzzwords Check
  const foundBuzzwords = BUZZWORDS.filter(w => allText.toLowerCase().includes(w));

  // 4. Bullet length check
  const shortBullets = allBullets.filter(b => b.trim().length > 0 && b.trim().length < 35);
  const longBullets = allBullets.filter(b => b.trim().length > 175);

  if (!resume) return <div className="p-8 text-center text-sm text-textMuted">Loading resume editor...</div>;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div className="flex items-center gap-3">
          <Link to="/resumes" className="p-2 rounded-btn hover:bg-neutralLight text-textSecondary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-headline font-bold text-xl text-carbon flex items-center gap-2">
              <span>{resume.title}</span>
              {saveSuccess && <span className="text-xs text-semanticSuccess font-normal inline-flex items-center gap-1">Saved <Check className="w-3 h-3 text-emerald-500" /></span>}
            </h1>
            <p className="text-xs text-textMuted">Target Role: {resume.target_role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/resumes/${resumeId}/assessment`}>
            <Button variant="outline" size="sm" icon={BarChart2}>
              Assess Readiness
            </Button>
          </Link>
          <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* 2-Column Workspace (70% Editor, 30% AI Assistant Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Summary Section */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wide">
                Professional Summary
              </h3>
              <Badge variant="neutral" size="sm">Standard Heading</Badge>
            </div>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-standard border border-borderStandard p-3 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
              placeholder="Concise 2-4 sentence summary of your technical focus, core accomplishments, and engineering goals."
            />
          </Card>

          {/* Skills Section */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wide">
                Technical Skills
              </h3>
              <Badge variant="neutral" size="sm">Comma Separated</Badge>
            </div>
            <textarea
              rows={3}
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full rounded-standard border border-borderStandard p-3 text-xs focus:ring-2 focus:ring-signature focus:outline-none font-mono"
              placeholder="Python, JavaScript, React, Docker, PostgreSQL, REST APIs..."
            />
            <p className="text-[11px] text-textMuted">
              Normalized aliases automatically mapped (e.g. "py" → Python, "k8s" → Kubernetes).
            </p>
          </Card>

          {/* Experience Section */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wide">
                Experience & Accomplishments
              </h3>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setExperience([...experience, { title: 'New Role', company: 'Company', bullets: ['Accomplished X...'] }])}
              >
                Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {experience.map((exp, expIdx) => (
                <div key={expIdx} className="p-4 rounded-standard border border-borderStandard bg-neutralLight/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[expIdx].title = e.target.value;
                        setExperience(copy);
                      }}
                    />
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[expIdx].company = e.target.value;
                        setExperience(copy);
                      }}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide">
                      Bullet Points (Google X-Y-Z Pattern)
                    </label>
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const copy = [...experience];
                            copy[expIdx].bullets[bulletIdx] = e.target.value;
                            setExperience(copy);
                          }}
                          className="flex-1 rounded-btn border border-borderStandard p-2 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...experience];
                            copy[expIdx].bullets = copy[expIdx].bullets.filter((_, idx) => idx !== bulletIdx);
                            setExperience(copy);
                          }}
                          className="p-1.5 text-textMuted hover:text-semanticError"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Plus}
                      onClick={() => {
                        const copy = [...experience];
                        copy[expIdx].bullets.push('Architected feature X, achieving Y% metric gain by implementing Z.');
                        setExperience(copy);
                      }}
                    >
                      Add Bullet Point
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Assistant & Diagnostic Panel (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="bg-white border-borderStrong space-y-4 shadow-sm">
            {/* Tab Header */}
            <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
              <div className="flex items-center gap-1 bg-neutralLight/70 p-1 rounded-btn border border-borderStandard text-xs w-full">
                <button
                  type="button"
                  onClick={() => setActiveRightTab('rewriter')}
                  className={`flex-1 py-1.5 rounded font-bold text-center transition ${
                    activeRightTab === 'rewriter'
                      ? 'bg-white text-signature shadow-sm'
                      : 'text-textSecondary hover:text-carbon'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Rewriter
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('diagnostics')}
                  className={`flex-1 py-1.5 rounded font-bold text-center transition ${
                    activeRightTab === 'diagnostics'
                      ? 'bg-white text-signature shadow-sm'
                      : 'text-textSecondary hover:text-carbon'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Live ATS Checks
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: AI REWRITER */}
            {activeRightTab === 'rewriter' && (
              <div className="space-y-4">
                <p className="text-xs text-textSecondary leading-relaxed">
                  Transform task lists into Google X-Y-Z achievement bullets: <em>"Accomplished [X] measured by [Y] by doing [Z]"</em>.
                </p>

                <Button
                  variant="secondary"
                  size="sm"
                  loading={loadingAi}
                  onClick={handleGenerateAiRewrites}
                  className="w-full"
                >
                  Analyze & Suggest Rewrites
                </Button>

                {/* Suggestions List */}
                <div className="space-y-3 pt-1">
                  {aiRewrites.length === 0 ? (
                    <div className="p-4 rounded-standard bg-surface border border-surfaceBorder text-center text-xs text-muted">
                      Click above to generate NLP rewrites for your current bullets.
                    </div>
                  ) : (
                    aiRewrites.map((rw, i) => (
                      <div key={i} className="p-3.5 rounded-standard border border-orange-200 bg-peach/30 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-textMuted block">Original</span>
                          <p className="text-textSecondary line-through">{rw.original}</p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-burnt block">Improved (X-Y-Z)</span>
                          <p className="font-semibold text-carbon">{rw.improved}</p>
                        </div>

                        <p className="text-[11px] text-textMuted italic">{rw.reason}</p>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-orange-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(rw.improved)}
                            icon={Copy}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Check}
                            onClick={() => applyRewrite(rw)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LIVE ATS DIAGNOSTICS */}
            {activeRightTab === 'diagnostics' && (
              <div className="space-y-4 text-xs">
                <p className="text-xs text-textSecondary leading-relaxed">
                  Real-time algorithmic checks detecting verb repetition, missing metrics, and ATS parsing traps.
                </p>

                {/* Repeated Verbs Warning */}
                {repeatedVerbs.length > 0 ? (
                  <div className="p-3 rounded-card bg-amber-50 border border-amber-200 space-y-1.5">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      Repeated Action Verbs Flagged
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Recruiters dock points for verb repetition. The following verbs appear multiple times:
                    </p>
                    {repeatedVerbs.map(([verb, count]) => (
                      <div key={verb} className="pt-1">
                        <span className="font-mono font-bold text-amber-950 capitalize">
                          "{verb}" (used {count}x)
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(POWER_VERB_ALTERNATIVES[verb] || ['orchestrated', 'pioneered', 'engineered']).map(alt => (
                            <span key={alt} className="px-1.5 py-0.5 rounded bg-white text-[10px] text-carbon border border-amber-200 font-semibold">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>No repetitive action verbs detected. High vocabulary variety!</span>
                  </div>
                )}

                {/* Quantifiable Metrics Warning */}
                {bulletsWithoutMetrics.length > 0 ? (
                  <div className="p-3 rounded-card bg-red-50 border border-red-200 space-y-1">
                    <span className="font-bold text-red-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                      Missing Metrics in {bulletsWithoutMetrics.length} Bullet(s)
                    </span>
                    <p className="text-[11px] text-red-800">
                      ATS content quality requires numbers, %, \$, or scale metrics to measure outcome impact.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>All bullet points feature quantifiable metrics and outcomes.</span>
                  </div>
                )}

                {/* Buzzwords Warning */}
                {foundBuzzwords.length > 0 ? (
                  <div className="p-3 rounded-card bg-amber-50 border border-amber-200 space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      Buzzwords Detected ({foundBuzzwords.length})
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Replace subjective claims with objective engineering metrics:
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {foundBuzzwords.map(w => (
                        <span key={w} className="px-1.5 py-0.5 rounded bg-amber-100 text-[10px] font-bold text-amber-900">
                          "{w}"
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>No empty clichés or buzzwords detected.</span>
                  </div>
                )}

                {/* Bullet Length Check */}
                {(shortBullets.length > 0 || longBullets.length > 0) && (
                  <div className="p-3 rounded-card bg-neutralLight/70 border border-borderStandard space-y-1 text-textSecondary text-[11px]">
                    <span className="font-bold text-carbon block">Formatting Length Audit</span>
                    {shortBullets.length > 0 && <p>• {shortBullets.length} bullet(s) too short (&lt; 35 chars). Expand on context.</p>}
                    {longBullets.length > 0 && <p>• {longBullets.length} bullet(s) too long (&gt; 175 chars). Split into two concise points.</p>}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
