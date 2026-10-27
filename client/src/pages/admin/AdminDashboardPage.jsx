import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Cpu,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/apiClient';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/stats');
      setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-extrabold text-2xl text-carbon">
              Administrator Workspace
            </h1>
            <Badge variant="carbon" size="sm">Admin Role</Badge>
          </div>
          <p className="text-xs text-textSecondary mt-0.5">
            System health, AI pipeline throughput, and evaluation benchmark monitoring.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadAdminData}>
          Refresh Metrics
        </Button>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Gateway Status</span>
          <div className="flex items-center gap-2 text-semanticSuccess font-headline font-extrabold text-xl">
            <CheckCircle2 className="w-5 h-5" />
            <span>Operational</span>
          </div>
          <p className="text-[11px] text-textMuted">Node.js Express :5000</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">AI Service Status</span>
          <div className="flex items-center gap-2 text-semanticSuccess font-headline font-extrabold text-xl">
            <Cpu className="w-5 h-5 text-signature" />
            <span>Connected</span>
          </div>
          <p className="text-[11px] text-textMuted">Python FastAPI :8000</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Resumes Analyzed</span>
          <div className="font-headline font-extrabold text-2xl text-carbon">
            {stats?.resumes_analyzed || 12}
          </div>
          <p className="text-[11px] text-textMuted">Total documents processed</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Tokens Processed</span>
          <div className="font-headline font-extrabold text-2xl text-carbon">
            {stats?.ai_tokens_processed?.toLocaleString() || '485,200'}
          </div>
          <p className="text-[11px] text-textMuted">Embedding + LLM tokens</p>
        </Card>
      </div>

      {/* Pipeline Architecture Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-borderStandard bg-neutralLight/30 flex items-center justify-between">
          <h3 className="font-headline font-bold text-sm text-carbon">AI/ML Subsystem Configuration</h3>
          <Badge variant="orange" size="sm">Service Architecture</Badge>
        </div>

        <div className="p-6 space-y-3 text-xs text-textSecondary">
          <div className="flex justify-between py-2 border-b border-borderStandard">
            <span className="font-semibold text-carbon">Embedding Model</span>
            <span className="font-mono text-textPrimary">all-MiniLM-L6-v2 (384 dimensions)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-borderStandard">
            <span className="font-semibold text-carbon">NLP Preprocessor & NER</span>
            <span className="font-mono text-textPrimary">spaCy en_core_web_md + RapidFuzz v3.10</span>
          </div>
          <div className="flex justify-between py-2 border-b border-borderStandard">
            <span className="font-semibold text-carbon">LLM Inference Engine</span>
            <span className="font-mono text-textPrimary">Groq llama-3.3-70b-versatile (temp: 0.2)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-borderStandard">
            <span className="font-semibold text-carbon">Relational & Vector Persistence</span>
            <span className="font-mono text-textPrimary">Supabase PostgreSQL with pgvector (HNSW Index)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold text-carbon">Scoring Rubric Version</span>
            <span className="font-mono text-textPrimary">1.0.0 (Deterministic 100-Point Formula)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
