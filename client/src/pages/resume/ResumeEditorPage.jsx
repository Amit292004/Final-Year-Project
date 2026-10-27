import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  BarChart2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/apiClient';

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

      // Save a new version
      await apiRequest(`/resumes/${resumeId}/versions`, {
        method: 'POST',
        body: JSON.stringify({
          data: updatedParsed,
          changeSummary: 'Updated sections and bullet points'
        })
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      alert('Failed to save changes.');
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

  const applyRewrite = (rewrite, expIdx, bulletIdx) => {
    const updated = [...experience];
    updated[expIdx].bullets[bulletIdx] = rewrite.improved;
    setExperience(updated);
    // remove applied rewrite from list
    setAiRewrites(aiRewrites.filter(r => r.original !== rewrite.original));
  };

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
              {saveSuccess && <span className="text-xs text-semanticSuccess font-normal">Saved ✓</span>}
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

      {/* 2-Column Workspace (70% Editor, 30% AI Rewriter) */}
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
              Our skill extractor normalizes variations (e.g. "py" → Python, "k8s" → Kubernetes).
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

        {/* AI Rewrite & Assistant Panel (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="bg-white border-borderStrong space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
              <div className="flex items-center gap-1.5 text-burnt font-bold text-xs">
                <Sparkles className="w-4 h-4 text-signature" />
                <span>AI Bullet-Point Rewriter</span>
              </div>
              <Badge variant="orange" size="sm">Google X-Y-Z</Badge>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed">
              Transform passive task lists into quantifiable achievement bullets: <em>"Accomplished [X] measured by [Y] by doing [Z]"</em>.
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
            <div className="space-y-4 pt-2">
              {aiRewrites.length === 0 ? (
                <div className="p-4 rounded-standard bg-ivory text-center text-xs text-textMuted">
                  Click above to run our NLP rewriter on your current bullet points.
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

                    {rw.requires_confirmation && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Confirm specific percentage metric matches your actual results.</span>
                      </div>
                    )}

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
                        onClick={() => applyRewrite(rw, 0, 0)}
                      >
                        Apply to Experience
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
