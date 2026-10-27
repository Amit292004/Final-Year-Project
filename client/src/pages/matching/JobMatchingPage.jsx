import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export function JobMatchingPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('Full Stack Software Engineer');
  const [company, setCompany] = useState('Acme Cloud Inc');
  const [jobDescription, setJobDescription] = useState(
    "We are seeking a Full Stack Software Engineer to build scalable microservices and web interfaces.\n\n" +
    "Requirements:\n" +
    "- 2+ years experience building web applications with Python and React\n" +
    "- Proficiency in PostgreSQL database design, query optimization, and schema migrations\n" +
    "- Strong hands-on knowledge of Docker containers and CI/CD pipelines\n" +
    "- Solid understanding of REST APIs and authentication protocols\n\n" +
    "Preferred / Bonus:\n" +
    "- Experience with Redis caching mechanisms\n" +
    "- Familiarity with Kubernetes and cloud deployments (AWS or GCP)"
  );
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
          resumeText: resumes.find(r => r.id === selectedResumeId)?.parsed_data?.raw_text || "Experienced software engineer with skills in Python, React, PostgreSQL, Docker, and REST APIs.",
          jobDescription,
          jobTitle,
          company
        })
      });
      setMatchResult(res.match);
    } catch (err) {
      alert(err.message || 'Failed to match job.');
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
    } catch (err) {
      alert('Failed to save to application tracker.');
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
            <h3 className="font-headline font-bold text-sm text-carbon uppercase tracking-wider">
              Target Role & Job Posting
            </h3>

            <form onSubmit={handleAnalyzeMatch} className="space-y-4">
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
                  <Link to="/interview">
                    <Button variant="primary" size="sm" icon={MessagesSquare}>
                      Prepare for Interview
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Matched vs Missing Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <Card className="space-y-3">
                  <div className="flex items-center gap-2 text-semanticSuccess font-bold text-xs uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Requirements ({matchResult.matched_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matched_skills.map((m, i) => (
                      <Badge key={i} variant="success" size="sm">
                        {m.skill}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Missing Skills */}
                <Card className="space-y-3">
                  <div className="flex items-center gap-2 text-semanticError font-bold text-xs uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4" />
                    <span>Missing Skills ({matchResult.missing_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing_skills.map((m, i) => (
                      <Badge key={i} variant="error" size="sm">
                        {m.skill}
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
