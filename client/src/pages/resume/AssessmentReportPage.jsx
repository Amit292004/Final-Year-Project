import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Layers,
  ListChecks,
  Code2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { apiRequest, API_BASE_URL } from '../../lib/apiClient';

export function AssessmentReportPage() {
  const { resumeId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState({});

  const toggleIssue = (index) => {
    setExpandedIssues(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const runAssessment = async () => {
    setLoading(true);
    try {
      const resumeData = await apiRequest(`/resumes/${resumeId}`);
      const rawText = resumeData.resume?.parsed_data?.raw_text || 'Experienced software developer with skills in Python and React.';
      
      const res = await apiRequest('/assessments', {
        method: 'POST',
        body: JSON.stringify({
          resumeId,
          resumeText: rawText,
          targetRole: resumeData.resume?.target_role || 'Software Engineer'
        })
      });
      setAssessment(res.assessment);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAssessment();
  }, [resumeId]);

  const handleDownloadReport = async () => {
    if (!assessment) return;
    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${assessment.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('careerfit_token') || 'demo'}`
        }
      });
      const htmlText = await response.text();
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlText);
        win.document.close();
        win.focus();
      } else {
        // Fallback if browser popup blocker blocked window.open
        const blob = new Blob([htmlText], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `careerfit_ats_report_${assessment.id}.html`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      toast.success('Report view ready!');
    } catch (e) {
      toast.error('Failed to generate report view: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
        <div className="w-10 h-10 border-4 border-signature border-t-transparent rounded-full animate-spin" />
        <h3 className="font-headline font-bold text-lg text-carbon">Evaluating 100-Point ATS Readiness</h3>
        <p className="text-xs text-textMuted max-w-sm">
          Calculating category scores, formatting consistency, Google X-Y-Z action verb density, and keyword coverage...
        </p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-semanticErrorBg text-semanticError flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-headline font-bold text-lg text-carbon">Unable to Load Assessment Report</h2>
          <p className="text-xs text-textSecondary max-w-sm mx-auto">
            We couldn't retrieve the ATS analysis for this resume. Ensure the resume exists or re-run the evaluation.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/resumes">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Resumes
              </Button>
            </Link>
            <Button variant="primary" size="sm" icon={RotateCcw} onClick={runAssessment}>
              Retry Analysis
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const cats = assessment.category_scores || {};
  const skillVal = assessment.skill_validation_details || { validated: [], unvalidated: [] };
  const issues = assessment.detailed_feedback || [];
  const strengths = assessment.strengths || [];
  const criticalIssues = assessment.critical_issues || [];
  const missingKeywords = assessment.missing_keywords || [];
  const recommendations = assessment.recommendations || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div className="flex items-center gap-3">
          <Link to="/resumes" className="p-2 rounded-btn hover:bg-neutralLight text-textSecondary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-bold text-2xl text-carbon">ATS Readiness Report</h1>
              <Badge variant="orange" size="sm">Scoring Engine v{assessment.scoring_version || '2.0.0'}</Badge>
            </div>
            <p className="text-xs text-textMuted">Role Benchmark: {assessment.target_role || 'Software Engineer'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/ats-scorer">
            <Button variant="outline" size="sm" icon={Sparkles}>
              Full Scorer & Matcher
            </Button>
          </Link>
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={runAssessment}>
            Re-run Scoring
          </Button>
          <Button variant="primary" size="sm" icon={Download} loading={downloading} onClick={handleDownloadReport}>
            Export HTML Report
          </Button>
        </div>
      </div>

      {/* Hero Score Showcase */}
      <Card className="bg-white border-borderStrong p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-borderStandard pb-6 md:pb-0 md:pr-8">
            <ScoreGauge score={assessment.overall_score} maxScore={100} size={170} />
            <span className="text-xs font-bold uppercase tracking-wider text-carbon mt-3">
              {assessment.readiness_level}
            </span>
            {assessment.interpretation && (
              <p className="text-xs text-center text-textSecondary mt-2 px-4 leading-relaxed italic">
                "{assessment.interpretation}"
              </p>
            )}
          </div>

          <div className="md:col-span-7 space-y-4">
            <h3 className="font-headline font-bold text-lg text-carbon">
              Objective 100-Point Readiness Model
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Calculated across 5 deterministic dimensions: Formatting (20 pts), Keywords (25 pts), Content Quality (25 pts), Skill Depth & Evidence (15 pts), and ATS Compatibility (15 pts).
            </p>

            <div className="space-y-3 pt-2">
              {Object.entries(cats).map(([key, cat]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-carbon">{cat.name}</span>
                    <span className="font-bold text-burnt">{cat.score} / {cat.max_score} pts</span>
                  </div>
                  <ProgressBar value={cat.score} max={cat.max_score} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Skill-Project Validation Evidence */}
      {(skillVal.validated?.length > 0 || skillVal.unvalidated?.length > 0) && (
        <Card className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderStandard pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-signature" />
              <h3 className="font-headline font-bold text-base text-carbon">
                Skill Validation & Project Evidence
              </h3>
            </div>
            <div className="text-xs font-semibold text-textSecondary">
              Proof Ratio: <span className="text-signature font-bold">{skillVal.validation_pct || 0}%</span> of skills backed by experience
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-semanticSuccess block mb-3">
                Validated Skills ({skillVal.validated?.length || 0})
              </span>
              <div className="space-y-2">
                {skillVal.validated?.map((item, idx) => (
                  <div key={idx} className="bg-semanticSuccessBg/30 p-2.5 rounded-standard text-xs flex items-center justify-between">
                    <span className="font-semibold text-carbon">{item.skill}</span>
                    <span className="text-textMuted text-[11px]">
                      {item.projects?.join(', ') || 'In context'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-semanticWarning block mb-3">
                Unvalidated Skills ({skillVal.unvalidated?.length || 0})
              </span>
              <div className="flex flex-wrap gap-2">
                {skillVal.unvalidated?.map((skill, idx) => (
                  <Badge key={idx} variant="warning" size="md">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-[11px] text-textMuted mt-3">
                ATS parsers look for contextual project or work experience proof for listed technical skills.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Strengths & Critical Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-semanticSuccess font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Identified Key Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-textSecondary">
            {strengths.length === 0 ? (
              <li className="text-textMuted italic">No specific strengths cataloged yet.</li>
            ) : (
              strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2 bg-semanticSuccessBg/30 p-2.5 rounded-standard">
                  <span className="text-semanticSuccess font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* Critical Issues */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-semanticError font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Critical Areas For Improvement</span>
          </div>
          <ul className="space-y-2 text-xs text-textSecondary">
            {criticalIssues.length === 0 ? (
              <li className="text-textMuted italic">No critical errors detected. Outstanding work!</li>
            ) : (
              criticalIssues.map((iss, i) => (
                <li key={i} className="flex items-start gap-2 bg-semanticErrorBg/40 p-2.5 rounded-standard">
                  <span className="text-semanticError font-bold">•</span>
                  <span>{iss}</span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {/* Deep ATS Issues Diagnostics */}
      {issues.length > 0 && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between border-b border-borderStandard pb-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-burnt" />
              <h3 className="font-headline font-bold text-base text-carbon">
                Deep ATS Diagnostics & Remediation Checklist
              </h3>
            </div>
            <span className="text-xs text-textMuted">{issues.length} detected diagnostics</span>
          </div>

          <div className="space-y-3">
            {issues.map((issue, idx) => {
              const isExpanded = !!expandedIssues[idx];
              const sevVariant = issue.severity_level === 'High' ? 'error' : issue.severity_level === 'Moderate' ? 'warning' : 'neutral';
              return (
                <div key={idx} className="border border-borderStandard rounded-standard overflow-hidden bg-white">
                  <button
                    onClick={() => toggleIssue(idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-neutralLight/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={sevVariant} size="sm">
                        {issue.severity_level}
                      </Badge>
                      <span className="font-semibold text-xs sm:text-sm text-carbon">
                        {issue.issue_title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-textMuted hidden sm:inline">
                        ATS Impact: {issue.ats_impact}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-textSecondary" /> : <ChevronDown className="w-4 h-4 text-textSecondary" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-borderStandard bg-neutralLight/20 text-xs space-y-3">
                      <div>
                        <span className="font-bold text-carbon">Explanation: </span>
                        <span className="text-textSecondary">{issue.explanation}</span>
                      </div>
                      <div>
                        <span className="font-bold text-carbon">Where it appears: </span>
                        <span className="text-textSecondary">{issue.where_it_appears}</span>
                      </div>
                      <div>
                        <span className="font-bold text-carbon">How to fix: </span>
                        <span className="text-textSecondary">{issue.how_to_fix}</span>
                      </div>

                      {issue.action_items?.length > 0 && (
                        <div className="pt-2">
                          <span className="font-bold text-carbon block mb-1">Step-by-Step Action Items:</span>
                          <ul className="space-y-1 pl-4 list-disc text-textSecondary">
                            {issue.action_items.map((item, aIdx) => (
                              <li key={aIdx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {issue.example_improvement && (
                        <div className="pt-2">
                          <span className="font-bold text-carbon block mb-1">Recommended Rewrite / Example:</span>
                          <pre className="p-3 bg-carbon text-warmIvory rounded text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {issue.example_improvement}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Missing Keywords & Recommendations */}
      <Card className="space-y-4">
        <h3 className="font-headline font-bold text-base text-carbon">
          Recommended Keywords & Next Actions
        </h3>
        <div>
          <span className="text-xs font-semibold text-textMuted uppercase tracking-wide block mb-2">
            Target Keywords To Incorporate:
          </span>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.length === 0 ? (
              <span className="text-xs text-textMuted italic">Excellent! Full keyword coverage achieved.</span>
            ) : (
              missingKeywords.map(kw => (
                <Badge key={kw} variant="warning" size="md">
                  + {kw}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-borderStandard space-y-2 text-xs text-textSecondary">
          <span className="font-semibold text-carbon block">Strategic Recommendations:</span>
          {recommendations.length === 0 ? (
            <p className="text-textMuted italic">No pending recommendations.</p>
          ) : (
            recommendations.map((rec, i) => (
              <p key={i}>• {rec}</p>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
