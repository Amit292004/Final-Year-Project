import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Copy,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Map,
  ShieldCheck,
  Layers,
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { apiRequest } from '../../lib/apiClient';

export function SkillGapPage() {
  const [gaps, setGaps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'verified' | 'unvalidated' | 'missing'
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/skills/gaps').then((data) => {
      setGaps(data.gaps || []);
      setSummary(data.summary || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCopyMissingAndUnvalidated = () => {
    const needAttention = gaps
      .filter(g => g.status === 'missing' || g.status === 'unvalidated')
      .map(g => g.skill_name)
      .join(', ');
    navigator.clipboard.writeText(needAttention);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredGaps = filterStatus === 'all'
    ? gaps
    : gaps.filter(g => g.status === filterStatus);

  const verifiedCount = gaps.filter(g => g.status === 'verified').length;
  const unvalidatedCount = gaps.filter(g => g.status === 'unvalidated').length;
  const missingCount = gaps.filter(g => g.status === 'missing').length;
  const total = gaps.length;
  const valPct = summary?.validation_pct ?? (total > 0 ? Math.round((verifiedCount / (verifiedCount + unvalidatedCount || 1)) * 100) : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-signature/10 text-signature">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="font-headline font-extrabold text-2xl text-carbon">
              Skill Gap & Evidence Analysis
            </h1>
          </div>
          <p className="text-xs text-textSecondary mt-1">
            Algorithmic project validation verifying whether listed skills are proven in projects and experience, alongside market demand gaps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={Copy} onClick={handleCopyMissingAndUnvalidated}>
            {copied ? 'Copied to Clipboard ✓' : 'Copy Skills Needing Attention'}
          </Button>
          <Link to="/roadmap">
            <Button variant="primary" size="sm" icon={Map}>
              Build Learning Roadmap
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">
            Substantiated Skills
          </span>
          <span className="font-headline font-extrabold text-2xl text-emerald-700 mt-1 block">
            {verifiedCount}
          </span>
          <span className="text-[11px] text-emerald-800 font-medium">Proven in projects or work history</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">
            Needs Project Proof
          </span>
          <span className="font-headline font-extrabold text-2xl text-amber-700 mt-1 block">
            {unvalidatedCount}
          </span>
          <span className="text-[11px] text-amber-800 font-medium">Listed in skills but missing evidence</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">
            Critical Market Gaps
          </span>
          <span className="font-headline font-extrabold text-2xl text-red-700 mt-1 block">
            {missingCount}
          </span>
          <span className="text-[11px] text-red-800 font-medium">Required by target role benchmark</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-signature">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">
            Project Proof Ratio
          </span>
          <span className="font-headline font-extrabold text-2xl text-signature mt-1 block">
            {valPct}%
          </span>
          <div className="w-full bg-borderStandard/40 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-signature rounded-full transition-all duration-500" style={{ width: `${Math.min(valPct, 100)}%` }} />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-neutralLight/70 p-1 rounded-btn border border-borderStandard text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded font-bold transition ${filterStatus === 'all' ? 'bg-white text-carbon shadow-sm' : 'text-textSecondary hover:text-carbon'}`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1 rounded font-bold transition ${filterStatus === 'verified' ? 'bg-white text-emerald-700 shadow-sm' : 'text-textSecondary hover:text-carbon'}`}
          >
            ✅ Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setFilterStatus('unvalidated')}
            className={`px-3 py-1 rounded font-bold transition ${filterStatus === 'unvalidated' ? 'bg-white text-amber-800 shadow-sm' : 'text-textSecondary hover:text-carbon'}`}
          >
            ⚠️ Needs Evidence ({unvalidatedCount})
          </button>
          <button
            onClick={() => setFilterStatus('missing')}
            className={`px-3 py-1 rounded font-bold transition ${filterStatus === 'missing' ? 'bg-white text-red-700 shadow-sm' : 'text-textSecondary hover:text-carbon'}`}
          >
            ❌ Missing Requirements ({missingCount})
          </button>
        </div>

        <span className="text-xs text-textMuted">
          Showing {filteredGaps.length} of {total} skills
        </span>
      </div>

      {/* Comparison Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-borderStandard bg-neutralLight/30 flex items-center justify-between">
          <h3 className="font-headline font-bold text-sm text-carbon">
            Competency & Validation Matrix
          </h3>
          <span className="text-xs text-textMuted">Benchmark: Software Engineer Industry Standard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutralLight/60 text-textMuted uppercase text-[10px] font-bold tracking-wider border-b border-borderStandard">
              <tr>
                <th className="py-3 px-6">Skill Name</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Evidence / Verification Source</th>
                <th className="py-3 px-6">Actionable Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderStandard">
              {filteredGaps.map((gap) => (
                <tr key={gap.id} className="hover:bg-neutralLight/20 transition">
                  <td className="py-3.5 px-6 font-semibold text-carbon">
                    <span className="block font-bold">{gap.skill_name}</span>
                    <span className="text-[10px] text-textMuted uppercase">{gap.category || 'Technical'}</span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      gap.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : gap.status === 'unvalidated'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {gap.status === 'verified' ? '✅ Proven Evidence' : gap.status === 'unvalidated' ? '⚠️ Missing Project Evidence' : '❌ Target Role Gap'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-textSecondary max-w-xs">
                    <p className="truncate font-mono text-[11px]">{gap.current_evidence}</p>
                    {gap.similarity_score && gap.status === 'verified' && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                        Semantic match: {(gap.similarity_score * 100).toFixed(0)}%
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-textSecondary max-w-sm">
                    <span className="text-carbon font-medium block">
                      {gap.recommendation || (gap.status === 'verified' ? 'Highlight quantitative outcomes in interview.' : `Build a concrete GitHub project showcasing ${gap.skill_name}.`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
