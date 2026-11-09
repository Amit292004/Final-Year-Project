import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Code2,
  Calendar,
  CheckSquare,
  Square,
  FileCheck,
  Search,
  ExternalLink,
  Layout,
  Key,
  Cpu,
  BarChart3,
  Target,
  Activity,
  Check,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AnimateIn } from '../../components/ui/AnimateIn';
import {
  analyzeResumeFile,
  fetchAtsHistory,
  deleteAtsHistory,
  downloadAtsReportBlob,
  downloadHistoryReportBlob
} from '../../lib/apiClient';

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
  high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' }
};

export function AtsScorerPage() {
  const [activeTab, setActiveTab] = useState('scorer'); // 'scorer' | 'history'
  const [analysisMode, setAnalysisMode] = useState('general'); // 'general' | 'jd'
  
  // Scorer Inputs
  const [file, setFile] = useState(null);
  const [jdInputMethod, setJdInputMethod] = useState('paste'); // 'paste' | 'file'
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  
  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Interactive Checklist
  const [checkedActions, setCheckedActions] = useState({});
  const [expandedIssues, setExpandedIssues] = useState({});

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const items = await fetchAtsHistory();
      setHistory(items || []);
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSetFile(selected);
  };

  const validateAndSetFile = (f) => {
    if (f.size > 5 * 1024 * 1024) {
      setError('Resume file exceeds maximum 5 MB limit.');
      return;
    }
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setError('Supported formats: PDF, DOCX, DOC, TXT.');
      return;
    }
    setFile(f);
    setError('');
  };

  const handleJdFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (!f.name.endsWith('.txt')) {
        setError('Job description files must be .txt format. Or paste the JD text directly.');
        return;
      }
      setJdFile(f);
      const reader = new FileReader();
      reader.onload = (evt) => setJdText(evt.target.result);
      reader.readAsText(f);
      setError('');
    }
  };

  const runAnalysis = async () => {
    if (!file) {
      setError('Please select or drop your resume file.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysisStep('Uploading and parsing document...');

    try {
      setTimeout(() => setAnalysisStep('Validating skills against experience and projects...'), 800);
      setTimeout(() => setAnalysisStep('Calculating 5-component ATS readiness score...'), 1600);
      setTimeout(() => setAnalysisStep('Evaluating 10 deep diagnostic ATS criteria...'), 2400);

      const finalJd = analysisMode === 'jd' ? jdText : '';
      const result = await analyzeResumeFile(file, finalJd);
      setAnalysis(result);
      setActiveTab('scorer');
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Failed to analyze resume. Please verify the file and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this historical analysis?')) return;
    setDeletingId(id);
    try {
      await deleteAtsHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success('Analysis record deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete entry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPdf = async (customAnalysis = null) => {
    const target = customAnalysis || analysis;
    if (!target) return;
    setDownloadingReport(true);
    try {
      const blob = await downloadAtsReportBlob(target);
      const url = URL.createObjectURL(blob);
      const isPdf = blob.type.includes('pdf');
      const ext = isPdf ? 'pdf' : 'html';
      const a = document.createElement('a');
      a.href = url;
      a.download = `ats_resume_report_${Date.now()}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate export report: ' + err.message);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleDownloadSummaryTxt = () => {
    if (!analysis) return;
    const score = analysis.ATS_score || analysis.ats_score || 0;
    let txt = `====================================\n`;
    txt += `CAREERFIT AI - ATS RESUME SCORE REPORT\n`;
    txt += `Overall ATS Score: ${score.toFixed(0)}/100\n`;
    txt += `Interpretation: ${analysis.interpretation || ''}\n`;
    txt += `====================================\n\n`;

    if (analysis.component_scores) {
      txt += `COMPONENT SCORES:\n`;
      txt += `- Formatting: ${analysis.component_scores.formatting}/20\n`;
      txt += `- Keywords: ${analysis.component_scores.keywords}/25\n`;
      txt += `- Content Quality: ${analysis.component_scores.content}/25\n`;
      txt += `- Skill Validation: ${analysis.component_scores.skill_validation}/15\n`;
      txt += `- ATS Compatibility: ${analysis.component_scores.ats_compatibility}/15\n\n`;
    }

    if (analysis.strengths && analysis.strengths.length > 0) {
      txt += `STRENGTHS:\n`;
      analysis.strengths.forEach(s => { txt += `  + ${s}\n`; });
      txt += `\n`;
    }

    if (analysis.detailed_feedback && analysis.detailed_feedback.length > 0) {
      txt += `DIAGNOSTIC ISSUES & ACTION ITEMS:\n`;
      analysis.detailed_feedback.forEach(item => {
        txt += `\n[${item.severity_level.toUpperCase()}] ${item.issue_title}\n`;
        txt += `Impact: ${item.ats_impact}\n`;
        txt += `Fix: ${item.how_to_fix}\n`;
        if (item.action_items) {
          item.action_items.forEach(a => { txt += `  - ${a}\n`; });
        }
      });
    }

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats_summary_${Date.now()}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleActionCheck = (key) => {
    setCheckedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleIssueExpand = (key) => {
    setExpandedIssues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Score styling helpers
  const score = analysis?.ATS_score ?? analysis?.ats_score ?? 0;
  let scoreBadgeColor = 'bg-red-100 text-red-800 border-red-300';
  if (score >= 80) {
    scoreBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (score >= 60) {
    scoreBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  const componentScores = analysis?.component_scores || {};
  const skillDetails = analysis?.skill_validation_details || {};
  const jdComparison = analysis?.jd_comparison || analysis?.jd_match_analysis;
  const detailedFeedback = analysis?.detailed_feedback || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Tab Navigation */}
      <AnimateIn delay={0}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderStandard pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-btn bg-signature/10 text-signature">
                <FileCheck className="w-5 h-5" />
              </span>
              <h1 className="text-heading text-2xl text-carbon">
                ATS Resume Scorer & Diagnostics
              </h1>
            </div>
            <p className="text-xs text-textSecondary mt-1">
              Deterministic 5-component scoring, project skill validation, fuzzy keyword coverage, and deep 10-issue diagnostic feedback.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-neutralLight/70 p-1 rounded-btn border border-borderStandard self-start">
            <button
              onClick={() => setActiveTab('scorer')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn transition-colors ease-custom-out ${
                activeTab === 'scorer'
                  ? 'bg-white text-carbon font-bold shadow-subtle border border-borderStandard'
                  : 'text-textSecondary hover:text-carbon'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-signature" />
              <span>ATS Scorer</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn transition-colors ease-custom-out ${
                activeTab === 'history'
                  ? 'bg-white text-carbon font-bold shadow-subtle border border-borderStandard'
                  : 'text-textSecondary hover:text-carbon'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Analysis History ({history.length})</span>
            </button>
          </div>
        </div>
      </AnimateIn>

      {/* ============================================================== */}
      {/* TAB 1: ATS SCORER */}
      {/* ============================================================== */}
      {activeTab === 'scorer' && (
        <div className="space-y-6">
          {/* Upload Configuration Area */}
          <AnimateIn delay={1}>
            <Card variant="elevated" className="p-6 border-borderStrong">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-borderStandard mb-6">
                <div>
                  <span className="text-overline text-textMuted font-semibold">
                    ANALYSIS TARGET
                  </span>
                  <p className="text-sm font-semibold text-carbon mt-0.5">
                    Select your scoring evaluation mode
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    onClick={() => setAnalysisMode('general')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-btn border text-xs font-semibold cursor-pointer transition-all ease-custom-out ${
                      analysisMode === 'general'
                        ? 'border-signature bg-peach/50 text-burnt font-bold shadow-subtle'
                        : 'border-borderStandard bg-white text-textSecondary hover:border-carbon/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="analysis_mode"
                      checked={analysisMode === 'general'}
                      onChange={() => setAnalysisMode('general')}
                      className="hidden"
                    />
                    <FileText className="w-3.5 h-3.5" />
                    <span>General ATS Score</span>
                  </label>

                  <label
                    onClick={() => setAnalysisMode('jd')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-btn border text-xs font-semibold cursor-pointer transition-all ease-custom-out ${
                      analysisMode === 'jd'
                        ? 'border-signature bg-peach/50 text-burnt font-bold shadow-subtle'
                        : 'border-borderStandard bg-white text-textSecondary hover:border-carbon/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="analysis_mode"
                      checked={analysisMode === 'jd'}
                      onChange={() => setAnalysisMode('jd')}
                      className="hidden"
                    />
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Job Description Comparison</span>
                  </label>
                </div>
              </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Resume Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-carbon uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-signature" />
                    Upload Resume File
                  </label>
                  <span className="text-[11px] text-textMuted">PDF, DOCX, TXT (Max 5MB)</span>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-card p-6 text-center transition flex flex-col items-center justify-center min-h-[190px] ${
                    isDragging
                      ? 'border-signature bg-peach/20'
                      : file
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-borderStandard bg-neutralLight/30 hover:bg-neutralLight/50'
                  }`}
                >
                  {file ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sm text-carbon truncate max-w-[260px]">{file.name}</p>
                      <p className="text-xs text-textMuted font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                      <button
                        onClick={() => setFile(null)}
                        className="text-xs text-red-600 hover:underline pt-1 block mx-auto"
                      >
                        Remove & choose another
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-neutralLight text-textSecondary flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-carbon">
                        Drag & drop resume here, or{' '}
                        <label className="text-signature underline cursor-pointer hover:text-burnt">
                          browse files
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-[11px] text-textMuted">
                        PDF hyperlinks, font weights, and sections are automatically preserved.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Job Description Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-carbon uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-signature" />
                    Target Job Description
                  </label>
                  {analysisMode === 'jd' ? (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setJdInputMethod('paste')}
                        className={`font-semibold ${jdInputMethod === 'paste' ? 'text-signature underline' : 'text-textMuted'}`}
                      >
                        Paste Text
                      </button>
                      <span className="text-borderStandard">|</span>
                      <button
                        type="button"
                        onClick={() => setJdInputMethod('file')}
                        className={`font-semibold ${jdInputMethod === 'file' ? 'text-signature underline' : 'text-textMuted'}`}
                      >
                        .txt File
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-textMuted">Optional in General Mode</span>
                  )}
                </div>

                {analysisMode === 'jd' ? (
                  jdInputMethod === 'paste' ? (
                    <div className="relative">
                      <textarea
                        rows={7}
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the target job description text here (requirements, qualifications, responsibilities)..."
                        className="w-full text-xs font-sans p-3 rounded-card border border-borderStandard focus:border-signature focus:ring-1 focus:ring-signature focus:outline-none resize-none"
                      />
                      <div className="flex items-center justify-between text-[11px] text-textMuted px-1 mt-1">
                        <span>{jdText.length} characters</span>
                        {jdText && (
                          <button
                            onClick={() => setJdText('')}
                            className="text-textMuted hover:text-red-600 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-borderStandard rounded-card p-6 text-center flex flex-col items-center justify-center min-h-[190px] bg-neutralLight/30">
                      <FileText className="w-8 h-8 text-textMuted mb-2" />
                      <p className="text-xs font-bold text-carbon">
                        Upload Job Description file (.txt only)
                      </p>
                      <label className="mt-2 inline-block">
                        <span className="px-3 py-1.5 text-xs font-bold text-white bg-carbon rounded-btn cursor-pointer hover:bg-black transition">
                          Browse .txt
                        </span>
                        <input
                          type="file"
                          accept=".txt"
                          onChange={handleJdFileChange}
                          className="hidden"
                        />
                      </label>
                      {jdFile && (
                        <p className="text-xs text-emerald-700 font-semibold mt-2 truncate flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{jdFile.name}</span>
                        </p>
                      )}
                    </div>
                  )
                ) : (
                  <div className="border border-borderStandard rounded-card p-6 text-center bg-neutralLight/20 flex flex-col items-center justify-center min-h-[190px]">
                    <p className="text-xs text-textSecondary max-w-sm">
                      Currently scoring in <strong>General Mode</strong>. Switch to <strong>Job Description Comparison</strong> above to analyze semantic overlap, keyword density, and skills gap against a specific requisition.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-card flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Run Action Bar */}
            <div className="mt-6 pt-4 border-t border-borderStandard flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-textMuted">
                {file ? `Selected resume: ${file.name}` : 'Upload your resume to begin comprehensive assessment.'}
              </span>

              <Button
                variant="primary"
                size="md"
                disabled={!file || analyzing}
                onClick={runAnalysis}
                className="w-full sm:w-auto px-8"
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Resume...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze Resume
                  </span>
                )}
              </Button>
            </div>

            {analyzing && (
              <div className="mt-4 p-4 rounded-card bg-neutralLight/60 border border-borderStandard space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-carbon">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-signature animate-ping" />
                    {analysisStep}
                  </span>
                  <span className="text-textMuted">100-point rubric</span>
                </div>
                <div className="w-full bg-borderStandard/40 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-signature rounded-full animate-pulse w-3/4 transition-all duration-500" />
                </div>
              </div>
            )}
          </Card>
          </AnimateIn>

          {/* ============================================================== */}
          {/* RESULTS DASHBOARD */}
          {/* ============================================================== */}
          {analysis && (
            <div className="space-y-6 animate-fadeIn">
              {/* Overall Score Header Card */}
              <Card className="p-6 overflow-hidden relative border-t-4 border-t-signature">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Gauge & Main Rating */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ScoreGauge score={score} size={150} strokeWidth={12} />
                    <div className="text-center sm:text-left space-y-1.5">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-2xl">{scoreEmoji}</span>
                        <h2 className="font-headline font-black text-3xl text-carbon">
                          {score.toFixed(0)} <span className="text-textMuted text-lg font-normal">/ 100</span>
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreBadgeColor}`}>
                          {score >= 80 ? 'Excellent' : score >= 60 ? 'Competitive' : 'Needs Work'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-carbon">Overall ATS Readiness Score</p>
                      <p className="text-xs text-textSecondary max-w-lg leading-relaxed">
                        {analysis.interpretation || 'Comprehensive assessment based on formatting structure, keyword density, content quality, project skill validation, and ATS parsing criteria.'}
                      </p>
                    </div>
                  </div>

                  {/* Export and Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Download}
                      disabled={downloadingReport}
                      onClick={() => handleDownloadPdf()}
                    >
                      {downloadingReport ? 'Generating Report...' : 'Download Full PDF'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FileText}
                      onClick={handleDownloadSummaryTxt}
                    >
                      Download Summary (.txt)
                    </Button>
                  </div>
                </div>

                {/* 5 Component Scores Grid */}
                <div className="mt-8 pt-6 border-t border-borderStandard grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Formatting', key: 'formatting', max: 20, icon: Layout, desc: 'Section headers, font size, margins' },
                    { label: 'Keywords & Skills', key: 'keywords', max: 25, icon: Key, desc: 'Technical skills, domain coverage' },
                    { label: 'Content Quality', key: 'content', max: 25, icon: FileText, desc: 'Action verbs, metrics, bullet points' },
                    { label: 'Skill Validation', key: 'skill_validation', max: 15, icon: CheckCircle2, desc: 'Proof in projects & experience' },
                    { label: 'ATS Compatibility', key: 'ats_compatibility', max: 15, icon: Cpu, desc: 'Parsing reliability, contact clarity' }
                  ].map((c) => {
                    const val = componentScores[c.key] ?? 0;
                    const pct = (val / c.max) * 100;
                    const barColor = pct >= 80 ? 'bg-emerald-600' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
                    const CompIcon = c.icon;

                    return (
                      <div key={c.key} className="p-3.5 rounded-card bg-neutralLight/40 border border-borderStandard space-y-2 hover:border-borderStrong transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-carbon flex items-center gap-1.5">
                            <CompIcon className="w-3.5 h-3.5 text-signature" /> {c.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-carbon">
                            {val.toFixed(0)}/{c.max}
                          </span>
                        </div>
                        <div className="w-full bg-borderStandard/40 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-textMuted truncate">{c.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Strengths & Critical Issues 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Card */}
                <Card padded={false} className="p-5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                  <h3 className="font-headline font-bold text-sm text-carbon flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Resume Strengths ({analysis.strengths?.length || 0})
                  </h3>
                  {analysis.strengths && analysis.strengths.length > 0 ? (
                    <ul className="space-y-2 text-xs text-textSecondary">
                      {analysis.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-textMuted italic">No standout strengths detected yet.</p>
                  )}
                </Card>

                {/* Critical Issues Card */}
                <Card padded={false} className="p-5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
                  <h3 className="font-headline font-bold text-sm text-carbon flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Critical Issues Flagged ({analysis.critical_issues?.length || 0})
                  </h3>
                  {analysis.critical_issues && analysis.critical_issues.length > 0 ? (
                    <ul className="space-y-2 text-xs text-textSecondary">
                      {analysis.critical_issues.map((iss, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span className="text-red-800 font-medium">{iss}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700 italic flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> No critical screening blockers found!
                    </p>
                  )}
                </Card>
              </div>

              {/* Skill Validation Breakdown */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-headline font-bold text-base text-carbon flex items-center gap-2">
                      <Layers className="w-4 h-4 text-signature" />
                      Project & Experience Skill Validation
                    </h3>
                    <p className="text-xs text-textMuted mt-0.5">
                      ATS scanners and senior engineering recruiters verify whether listed skills are actually used in project descriptions and work bullets.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral" size="sm">
                      {skillDetails.validated_count || 0} / {skillDetails.total || 0} Validated
                    </Badge>
                    <Badge
                      variant={(skillDetails.validation_pct || 0) >= 70 ? 'success' : 'warning'}
                      size="sm"
                    >
                      {(skillDetails.validation_pct || 0).toFixed(0)}% Evidence
                    </Badge>
                  </div>
                </div>

                <div className="w-full bg-borderStandard/40 h-2.5 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(skillDetails.validation_pct || 0, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Validated Skills */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Substantiated Skills ({skillDetails.validated?.length || 0})
                    </span>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {skillDetails.validated && skillDetails.validated.length > 0 ? (
                        skillDetails.validated.map((v, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-card bg-emerald-50/50 border border-emerald-200/60 flex items-start justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="font-bold text-emerald-950 block">{v.skill}</span>
                              <span className="text-[11px] text-emerald-700">
                                Applied in: {v.projects?.length > 0 ? v.projects.join(', ') : 'Experience section'}
                              </span>
                            </div>
                            {v.similarity && (
                              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {(v.similarity * 100).toFixed(0)}% match
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-textMuted italic">No verified skills detected in projects.</p>
                      )}
                    </div>
                  </div>

                  {/* Unvalidated Skills */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      Unvalidated Skills ({skillDetails.unvalidated?.length || 0})
                    </span>
                    <p className="text-[11px] text-textMuted">
                      These skills are listed in your skills section but lack concrete evidence in project descriptions or experience bullets.
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pt-1">
                      {skillDetails.unvalidated && skillDetails.unvalidated.length > 0 ? (
                        skillDetails.unvalidated.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700 italic">All listed skills have supporting project evidence!</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Job Description Match Breakdown (if JD provided) */}
              {jdComparison && (
                <Card padded={false} className="p-6 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="font-headline font-bold text-base text-carbon flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        Target Job Description Alignment
                      </h3>
                      <p className="text-xs text-textMuted mt-0.5">
                        Keyword overlap, semantic vector similarity, and skills gap analysis against the target posting.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-textMuted block">Match %</span>
                        <span className="font-headline font-black text-lg text-indigo-600">
                          {(jdComparison.match_percentage || 0).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-right pl-3 border-l border-borderStandard">
                        <span className="text-[10px] uppercase font-bold text-textMuted block">Semantic Sim</span>
                        <span className="font-headline font-black text-lg text-indigo-600">
                          {((jdComparison.semantic_similarity || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Matched Keywords */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                        Matched Keywords ({jdComparison.matched_keywords?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                        {jdComparison.matched_keywords && jdComparison.matched_keywords.length > 0 ? (
                          jdComparison.matched_keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded"
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-textMuted italic">No keywords matched yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
                        Missing Keywords ({jdComparison.missing_keywords?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                        {jdComparison.missing_keywords && jdComparison.missing_keywords.length > 0 ? (
                          jdComparison.missing_keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-800 border border-red-200 rounded"
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-700 italic">All key terms matched!</span>
                        )}
                      </div>
                    </div>

                    {/* Skills Gap */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        Skills Gap ({jdComparison.skills_gap?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                        {jdComparison.skills_gap && jdComparison.skills_gap.length > 0 ? (
                          jdComparison.skills_gap.map((sg, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded"
                            >
                              {sg}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-700 italic">No significant skills gap.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Deep ATS Diagnostic Feedback (The 10 Diagnostic Checks) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-carbon flex items-center gap-2">
                      <Activity className="w-5 h-5 text-signature" />
                      <span>Deep ATS Diagnostic Checks ({detailedFeedback.length} Flagged)</span>
                    </h3>
                    <p className="text-xs text-textMuted mt-0.5">
                      Detailed line-by-line checks for formatting, page length, verb repetition, metrics, privacy, and ATS compliance.
                    </p>
                  </div>
                </div>

                {detailedFeedback.length === 0 ? (
                  <Card className="p-6 text-center bg-emerald-50/40 border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-bold text-sm text-emerald-900">Flawless Diagnostic Results!</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      No ATS formatting errors, verb repetition, length issues, or missing metrics were detected on your resume.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {detailedFeedback.map((issue, idx) => {
                      const sev = (issue.severity_level || 'low').toLowerCase();
                      const colors = SEVERITY_COLORS[sev] || SEVERITY_COLORS.low;
                      const isExpanded = expandedIssues[idx] ?? (idx === 0);

                      return (
                        <div
                          key={idx}
                          className={`rounded-card border transition-all duration-200 ${colors.bg} ${colors.border}`}
                        >
                          <div
                            onClick={() => toggleIssueExpand(idx)}
                            className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${colors.badge}`}>
                                {issue.severity_level}
                              </span>
                              <div className="min-w-0">
                                <h4 className={`font-bold text-sm truncate ${colors.text}`}>
                                  {issue.issue_title}
                                </h4>
                                <p className="text-xs text-textMuted truncate">
                                  {issue.ats_impact}
                                </p>
                              </div>
                            </div>

                            <button className="text-textMuted hover:text-carbon shrink-0">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-carbon/5 space-y-3 text-xs">
                              {issue.explanation && (
                                <div>
                                  <span className="font-bold text-carbon block mb-0.5">What's happening:</span>
                                  <p className="text-textSecondary leading-relaxed">{issue.explanation}</p>
                                </div>
                              )}

                              {issue.where_it_appears && (
                                <div>
                                  <span className="font-bold text-carbon block mb-0.5">Where it appears:</span>
                                  <p className="text-textSecondary font-mono bg-white/70 p-2 rounded border border-carbon/10">
                                    {issue.where_it_appears}
                                  </p>
                                </div>
                              )}

                              {issue.how_to_fix && (
                                <div>
                                  <span className="font-bold text-carbon block mb-0.5">How to fix:</span>
                                  <p className="text-textSecondary leading-relaxed">{issue.how_to_fix}</p>
                                </div>
                              )}

                              {issue.action_items && issue.action_items.length > 0 && (
                                <div>
                                  <span className="font-bold text-carbon block mb-1">Action items:</span>
                                  <ul className="space-y-1">
                                    {issue.action_items.map((act, i) => (
                                      <li key={i} className="flex items-start gap-2 text-textSecondary">
                                        <span className="font-bold text-signature shrink-0">▪</span>
                                        <span>{act}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {issue.example_improvement && (
                                <div>
                                  <span className="font-bold text-carbon block mb-1">Example improvement:</span>
                                  <pre className="p-3 rounded bg-carbon text-neutralLight font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
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
                )}
              </div>

              {/* Action Items Interactive Checklist */}
              {detailedFeedback.some(item => item.action_items?.length > 0) && (
                <Card padded={false} className="p-6 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-signature" />
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-headline font-bold text-base text-carbon flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-signature" />
                        Priority Action Checklist
                      </h3>
                      <p className="text-xs text-textMuted mt-0.5">
                        Track your resume revisions step-by-step. Tick items as you apply fixes to your document.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {detailedFeedback.flatMap((issue, idx) =>
                      (issue.action_items || []).map((action, actionIdx) => {
                        const key = `${idx}_${actionIdx}`;
                        const isDone = !!checkedActions[key];

                        return (
                          <div
                            key={key}
                            onClick={() => toggleActionCheck(key)}
                            className={`p-3 rounded-card border flex items-start gap-3 cursor-pointer select-none transition ${
                              isDone
                                ? 'bg-neutralLight/40 border-borderStandard opacity-60'
                                : 'bg-white border-borderStandard hover:border-signature/40'
                            }`}
                          >
                            <button className="mt-0.5 text-signature shrink-0">
                              {isDone ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-textMuted" />}
                            </button>
                            <div className="min-w-0">
                              <span className={`text-xs block ${isDone ? 'line-through text-textMuted' : 'font-medium text-carbon'}`}>
                                {action}
                              </span>
                              <span className="text-[10px] text-textMuted uppercase font-bold">
                                Source: {issue.issue_title}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ANALYSIS HISTORY */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
            <div>
              <h2 className="font-headline font-bold text-base text-carbon">
                Saved Resume Analyses
              </h2>
              <p className="text-xs text-textMuted">
                Review past ATS scores, track improvements across resume iterations, or re-download PDF reports.
              </p>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadHistory}>
              Refresh
            </Button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-textMuted">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-signature" />
              Loading your analysis history...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-textMuted mx-auto" />
              <p className="font-bold text-sm text-carbon">No past analyses recorded</p>
              <p className="text-xs text-textMuted max-w-sm mx-auto">
                Run an ATS evaluation in the Scorer tab to save an analysis history record.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('scorer')}
              >
                Go to ATS Scorer
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-borderStandard">
              {history.map((entry) => {
                const analysisData = entry.analysis_result || {};
                const entryScore = entry.ats_score ?? analysisData.ats_score ?? 0;
                const cs = analysisData.component_scores || {};
                const jd = analysisData.jd_comparison || analysisData.jd_match_analysis;
                const isDeleting = deletingId === entry.id;

                return (
                  <div key={entry.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-carbon truncate">
                          {entry.filename || 'resume.pdf'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                            entryScore >= 80 ? 'bg-emerald-100 text-emerald-800' : entryScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entryScore.toFixed(0)}/100
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textMuted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>Formatting: {cs.formatting ?? 0}/20</span>
                        <span>Keywords: {cs.keywords ?? 0}/25</span>
                        <span>Content: {cs.content ?? 0}/25</span>
                        <span>Validation: {cs.skill_validation ?? 0}/15</span>
                        {jd && <span className="text-indigo-600 font-semibold">JD Match: {jd.match_percentage?.toFixed(0)}%</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setAnalysis(analysisData);
                          setActiveTab('scorer');
                        }}
                      >
                        Inspect Result
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={async () => {
                          try {
                            const blob = await downloadHistoryReportBlob(entry.id);
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ats_report_${entry.id}.pdf`;
                            a.click();
                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                            toast.success('Report downloaded!');
                          } catch (e) {
                            toast.error('Failed to download report: ' + e.message);
                          }
                        }}
                      >
                        PDF
                      </Button>

                      <button
                        onClick={(e) => handleDeleteHistory(entry.id, e)}
                        disabled={isDeleting}
                        className="p-1.5 rounded text-textMuted hover:text-red-600 hover:bg-neutralLight transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
