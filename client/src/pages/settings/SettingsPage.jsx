import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User,
  Shield,
  Cpu,
  Download,
  Trash2,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Sliders,
  Database
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { apiRequest } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [location, setLocation] = useState('Remote');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    apiRequest('/profiles/me').then((data) => {
      const p = data.profile || {};
      setProfile(p);
      setFullName(p.full_name || user?.user_metadata?.full_name || '');
      setTargetRole(p.target_role || 'Software Engineer');
      setLocation(p.location || 'Remote');
    }).catch(console.error);
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: fullName,
          target_role: targetRole,
          location
        })
      });
      setSavedSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await apiRequest('/profiles/export', { method: 'POST' });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careerfit_export_${Date.now()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Data exported successfully!');
    } catch (e) {
      toast.error('Failed to export data: ' + e.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiRequest('/profiles/me', { method: 'DELETE' });
      await signOut();
      toast.success('Account deleted');
      navigate('/');
    } catch (e) {
      toast.error('Failed to delete account: ' + e.message);
    }
  };

  const [atsBenchmark, setAtsBenchmark] = useState('tier1');
  const [suggestionStyle, setSuggestionStyle] = useState('xyz');
  const [autoSaveMatches, setAutoSaveMatches] = useState(true);

  const tabs = [
    { id: 'profile', label: 'Candidate Profile', icon: User },
    { id: 'privacy', label: 'Privacy & Data Export', icon: Shield },
    { id: 'system', label: 'AI Engine & System Status', icon: Cpu }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-borderStandard">
        <h1 className="font-headline font-extrabold text-2xl text-carbon">
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-textSecondary mt-0.5">
          Manage your candidate profile details, privacy controls, and data portability.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <Card className="max-w-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
            <h3 className="font-headline font-bold text-base text-carbon">Candidate Identity</h3>
            {savedSuccess && (
              <span className="text-xs text-semanticSuccess font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Changes saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Account Email"
              value={user?.email || 'candidate@careerfit.ai'}
              disabled
              helperText="Managed through Supabase Auth identity."
            />

            <Input
              label="Target Role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              helperText="Benchmark role used for keyword evaluation."
            />

            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Button type="submit" variant="primary" loading={saving}>
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {/* Tab 2: Privacy & Data Export */}
      {activeTab === 'privacy' && (
        <div className="max-w-2xl space-y-6">
          <Card className="space-y-4">
            <h3 className="font-headline font-bold text-base text-carbon">
              Data Portability & Export
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              In accordance with data minimization principles, you can export your complete candidate history, including parsed resumes, ATS scores, and interview logs as structured JSON.
            </p>
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportData}>
              Export All CareerFit Data (JSON)
            </Button>
          </Card>

          <Card className="space-y-4 border-red-200 bg-red-50/30">
            <div className="flex items-center gap-2 text-semanticError font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Danger Zone: Account Deletion</span>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              Permanently delete your profile, private documents, scores, and application tracking records. This action cannot be reversed.
            </p>
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteModalOpen(true)}>
              Delete Account & All Data
            </Button>
          </Card>
        </div>
      )}

      {/* Tab 3: AI Engine & System Status */}
      {activeTab === 'system' && (
        <div className="max-w-2xl space-y-6">
          {/* Subsystem Health Cards */}
          <Card className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-signature" />
                <h3 className="font-headline font-bold text-base text-carbon">AI/ML Subsystem Diagnostics</h3>
              </div>
              <Badge variant="success">All Services Operational</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-standard border border-borderStandard bg-neutralLight/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-carbon">LLM Inference Core</span>
                  <span className="w-2 h-2 rounded-full bg-semanticSuccess animate-pulse" />
                </div>
                <p className="text-[11px] text-textMuted">Gemini 1.5 Flash • Latency: ~780ms</p>
                <span className="inline-block text-[10px] font-semibold text-semanticSuccess">Deterministic Scoring</span>
              </div>

              <div className="p-3 rounded-standard border border-borderStandard bg-neutralLight/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-carbon">Dense Embedding Engine</span>
                  <span className="w-2 h-2 rounded-full bg-semanticSuccess" />
                </div>
                <p className="text-[11px] text-textMuted">all-MiniLM-L6-v2 • 384 Dimensions</p>
                <span className="inline-block text-[10px] font-semibold text-semanticSuccess">Cosine Similarity Matrix</span>
              </div>

              <div className="p-3 rounded-standard border border-borderStandard bg-neutralLight/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-carbon">Document Parser</span>
                  <span className="w-2 h-2 rounded-full bg-semanticSuccess" />
                </div>
                <p className="text-[11px] text-textMuted">pdfplumber & Regex Tokenizer</p>
                <span className="inline-block text-[10px] font-semibold text-semanticSuccess">Structure Extraction Active</span>
              </div>

              <div className="p-3 rounded-standard border border-borderStandard bg-neutralLight/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-carbon">RAG Knowledge Store</span>
                  <span className="w-2 h-2 rounded-full bg-semanticSuccess" />
                </div>
                <p className="text-[11px] text-textMuted">PostgreSQL & pgvector + RLS</p>
                <span className="inline-block text-[10px] font-semibold text-semanticSuccess">Row-Level Isolation</span>
              </div>
            </div>

            <div className="p-4 rounded-standard bg-peach/40 border border-orange-200 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-signature" />
                <span className="font-headline font-bold text-sm text-burnt">Complete Platform Access</span>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed">
                You are utilizing CareerFit AI with unrestricted access to all 7 candidate intelligence modules. ATS scoring, semantic job matching, customized roadmaps, and mock interview practice have zero paywalls or artificial limits.
              </p>
            </div>
          </Card>

          {/* AI Analysis Tuning Preferences */}
          <Card className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-signature" />
                <h3 className="font-headline font-bold text-base text-carbon">Analysis & Scoring Preferences</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-carbon mb-1">
                  ATS Rubric Strictness
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setAtsBenchmark('standard')}
                    className={`p-3 rounded-btn border text-left transition ${
                      atsBenchmark === 'standard'
                        ? 'border-signature bg-peach/40 text-carbon font-semibold'
                        : 'border-borderStandard bg-white text-textSecondary hover:bg-neutralLight/30'
                    }`}
                  >
                    <span className="block font-bold">Standard Industry ATS</span>
                    <span className="text-[11px] text-textMuted">Aligned with Greenhouse, Lever, and Workday baselines.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAtsBenchmark('tier1')}
                    className={`p-3 rounded-btn border text-left transition ${
                      atsBenchmark === 'tier1'
                        ? 'border-signature bg-peach/40 text-carbon font-semibold'
                        : 'border-borderStandard bg-white text-textSecondary hover:bg-neutralLight/30'
                    }`}
                  >
                    <span className="block font-bold">High Selectivity (FAANG / Tier-1)</span>
                    <span className="text-[11px] text-textMuted">Requires strict Google X-Y-Z quantifiable metrics and deep skill evidence.</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">
                  AI Suggestion Syntax
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSuggestionStyle('xyz')}
                    className={`p-3 rounded-btn border text-left transition ${
                      suggestionStyle === 'xyz'
                        ? 'border-signature bg-peach/40 text-carbon font-semibold'
                        : 'border-borderStandard bg-white text-textSecondary hover:bg-neutralLight/30'
                    }`}
                  >
                    <span className="block font-bold">Google X-Y-Z Formula</span>
                    <span className="text-[11px] text-textMuted">"Accomplished [X] measured by [Y] by doing [Z]"</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSuggestionStyle('executive')}
                    className={`p-3 rounded-btn border text-left transition ${
                      suggestionStyle === 'executive'
                        ? 'border-signature bg-peach/40 text-carbon font-semibold'
                        : 'border-borderStandard bg-white text-textSecondary hover:bg-neutralLight/30'
                    }`}
                  >
                    <span className="block font-bold">Executive Action + Competency</span>
                    <span className="text-[11px] text-textMuted">Concise senior leadership phrasing with high-impact verbs.</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-borderStandard flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-carbon block">Auto-Sync Matches to Kanban</span>
                  <span className="text-[11px] text-textMuted">Automatically create a "Preparing" card when you match a job with &gt;75% similarity.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveMatches(!autoSaveMatches)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    autoSaveMatches ? 'bg-signature' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      autoSaveMatches ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
              Permanently Delete
            </Button>
          </>
        }
      >
        <p className="text-xs text-textSecondary leading-relaxed">
          Are you sure you want to delete your CareerFit AI account? All your uploaded resumes, generated evaluations, interview answers, and job tracking records will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}
