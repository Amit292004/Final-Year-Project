import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { apiRequest } from '../../lib/apiClient';

export function AssessmentReportPage() {
  const { resumeId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
      const response = await fetch(`http://localhost:5000/api/v1/assessments/${assessment.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('careerfit_token') || 'demo'}`
        }
      });
      const htmlText = await response.text();
      // Open in new tab or trigger print
      const win = window.open('', '_blank');
      win.document.write(htmlText);
      win.document.close();
      win.focus();
    } catch (e) {
      alert('Failed to generate report view.');
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

  if (!assessment) return <div className="p-8 text-center text-sm">Failed to load assessment report.</div>;

  const cats = assessment.category_scores || {};

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
              <Badge variant="orange" size="sm">Scoring Engine v{assessment.scoring_version}</Badge>
            </div>
            <p className="text-xs text-textMuted">Role Benchmark: {assessment.target_role || 'Software Engineer'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={runAssessment}>
            Re-run Scoring
          </Button>
          <Button variant="primary" size="sm" icon={Download} loading={downloading} onClick={handleDownloadReport}>
            Export PDF Report
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
          </div>

          <div className="md:col-span-7 space-y-4">
            <h3 className="font-headline font-bold text-lg text-carbon">
              Objective 100-Point Readiness Model
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              This score reflects automated ATS parseability, technical keyword alignment, and quantifiable outcome density. It represents an empirical preparation metric and not a guarantee of employer hiring outcomes.
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

      {/* Strengths & Critical Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-semanticSuccess font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Identified Key Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-textSecondary">
            {assessment.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2 bg-semanticSuccessBg/30 p-2.5 rounded-standard">
                <span className="text-semanticSuccess font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Critical Issues */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-semanticError font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Critical Areas For Improvement</span>
          </div>
          <ul className="space-y-2 text-xs text-textSecondary">
            {assessment.critical_issues.map((iss, i) => (
              <li key={i} className="flex items-start gap-2 bg-semanticErrorBg/40 p-2.5 rounded-standard">
                <span className="text-semanticError font-bold">•</span>
                <span>{iss}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

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
            {assessment.missing_keywords.map(kw => (
              <Badge key={kw} variant="warning" size="md">
                + {kw}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-borderStandard space-y-2 text-xs text-textSecondary">
          <span className="font-semibold text-carbon block">Strategic Recommendations:</span>
          {assessment.recommendations.map((rec, i) => (
            <p key={i}>• {rec}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}
