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
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/apiClient';

export function SkillGapPage() {
  const [gaps, setGaps] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/skills/gaps').then((data) => {
      setGaps(data.gaps || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCopyMissing = () => {
    const missing = gaps.filter(g => g.status === 'missing').map(g => g.skill_name).join(', ');
    navigator.clipboard.writeText(missing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-carbon">
            Skill Gap Analysis
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Compare your verified resume competencies against target role benchmarks and market demand.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={Copy} onClick={handleCopyMissing}>
            {copied ? 'Copied ✓' : 'Copy Missing Skills'}
          </Button>
          <Link to="/roadmap">
            <Button variant="primary" size="sm" icon={Map}>
              Create Learning Roadmap
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-semanticSuccess">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">Verified Skills</span>
          <span className="font-headline font-extrabold text-2xl text-carbon mt-1 block">
            {gaps.filter(g => g.status === 'verified').length}
          </span>
          <span className="text-[11px] text-semanticSuccess font-medium">Explicitly evidenced on resume</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-semanticWarning">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">Partial Matches</span>
          <span className="font-headline font-extrabold text-2xl text-carbon mt-1 block">
            {gaps.filter(g => g.status === 'partial').length}
          </span>
          <span className="text-[11px] text-semanticWarning font-medium">Related tooling or theory cited</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-semanticError">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">Critical Gaps</span>
          <span className="font-headline font-extrabold text-2xl text-carbon mt-1 block">
            {gaps.filter(g => g.status === 'missing').length}
          </span>
          <span className="text-[11px] text-semanticError font-medium">High priority for target role</span>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-borderStandard bg-neutralLight/30 flex items-center justify-between">
          <h3 className="font-headline font-bold text-sm text-carbon">Role Competency Matrix</h3>
          <span className="text-xs text-textMuted">Benchmark: Software Engineer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutralLight/60 text-textMuted uppercase text-[10px] font-bold tracking-wider border-b border-borderStandard">
              <tr>
                <th className="py-3 px-6">Skill Name</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Importance</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Identified Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderStandard">
              {gaps.map((gap) => (
                <tr key={gap.id} className="hover:bg-neutralLight/20 transition">
                  <td className="py-3.5 px-6 font-semibold text-carbon">
                    {gap.skill_name}
                  </td>
                  <td className="py-3.5 px-6 text-textSecondary uppercase text-[10px] font-medium">
                    {gap.category}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`font-semibold ${
                      gap.importance === 'critical' ? 'text-semanticError' : 'text-semanticWarning'
                    }`}>
                      {gap.importance}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge variant={
                      gap.status === 'verified' ? 'success' : gap.status === 'partial' ? 'warning' : 'error'
                    } size="sm">
                      {gap.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-textSecondary">
                    {gap.current_evidence}
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
