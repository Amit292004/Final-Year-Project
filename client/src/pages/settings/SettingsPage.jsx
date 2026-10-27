import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle
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
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      alert('Failed to update profile.');
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
    } catch (e) {
      alert('Failed to export data.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiRequest('/profiles/me', { method: 'DELETE' });
      await signOut();
      window.location.href = '/';
    } catch (e) {
      alert('Failed to delete account.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Candidate Profile', icon: User },
    { id: 'privacy', label: 'Privacy & Data Export', icon: Shield },
    { id: 'billing', label: 'Subscription & Billing', icon: CreditCard }
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

      {/* Tab 3: Billing */}
      {activeTab === 'billing' && (
        <Card className="max-w-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
            <h3 className="font-headline font-bold text-base text-carbon">Subscription Plan</h3>
            <Badge variant="orange">Academic Pro Preview</Badge>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-standard bg-peach/40 border border-orange-200 space-y-2">
              <span className="font-headline font-bold text-sm text-burnt">Unlimited AI Feature Access</span>
              <p className="text-xs text-textSecondary leading-relaxed">
                Payment gateway integration is currently unconfigured. All ATS scoring, dense semantic job matching, learning roadmaps, and mock interview practice are unlocked.
              </p>
            </div>

            <div className="pt-2 space-y-1.5 text-xs text-textSecondary">
              <div className="flex justify-between py-1 border-b border-borderStandard">
                <span>ATS Resume Evaluations</span>
                <span className="font-bold text-carbon">Unlimited</span>
              </div>
              <div className="flex justify-between py-1 border-b border-borderStandard">
                <span>AI Bullet Point Rewrites</span>
                <span className="font-bold text-carbon">Unlimited</span>
              </div>
              <div className="flex justify-between py-1 border-b border-borderStandard">
                <span>pgvector Semantic Matches</span>
                <span className="font-bold text-carbon">Unlimited</span>
              </div>
            </div>
          </div>
        </Card>
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
