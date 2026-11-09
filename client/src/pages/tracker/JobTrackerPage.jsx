import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  KanbanSquare,
  Table as TableIcon,
  Plus,
  Building,
  Calendar,
  Trash2,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { apiRequest } from '../../lib/apiClient';

const STAGES = [
  { id: 'wishlist', label: 'Wishlist', color: 'border-t-gray-400' },
  { id: 'preparing', label: 'Preparing', color: 'border-t-amber-400' },
  { id: 'applied', label: 'Applied', color: 'border-t-blue-500' },
  { id: 'assessment', label: 'Assessment', color: 'border-t-purple-500' },
  { id: 'interview', label: 'Interview', color: 'border-t-signature' },
  { id: 'offer', label: 'Offer', color: 'border-t-semanticSuccess' },
  { id: 'rejected', label: 'Rejected', color: 'border-t-red-400' }
];

export function JobTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [viewMode, setViewMode] = useState('board'); // board, table
  const [modalOpen, setModalOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('');
  const [stage, setStage] = useState('wishlist');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');

  const loadApplications = async () => {
    try {
      const data = await apiRequest('/applications');
      setApplications(data.applications || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleCreateApplication = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!company || !role) return;

    try {
      const res = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({
          company,
          role,
          location,
          salaryRange: salary,
          stage,
          notes,
          nextAction
        })
      });
      setApplications(prev => [res.application, ...prev]);
      setModalOpen(false);
      // Reset
      setCompany('');
      setRole('');
      setLocation('Remote');
      setSalary('');
      setStage('wishlist');
      setNotes('');
      setNextAction('');
      toast.success('Opportunity added to tracker!');
    } catch (err) {
      toast.error('Failed to save application: ' + err.message);
    }
  };

  const handleStageChange = async (appId, newStage) => {
    try {
      await apiRequest(`/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage })
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
      toast.success(`Moved to ${newStage}`);
    } catch (e) {
      toast.error('Failed to update stage.');
    }
  };

  const handleDelete = async (appId) => {
    if (!confirm('Remove this application from your tracker?')) return;
    try {
      await apiRequest(`/applications/${appId}`, { method: 'DELETE' });
      setApplications(prev => prev.filter(a => a.id !== appId));
      toast.success('Application removed');
    } catch (e) {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-carbon">
            Job Application Tracker
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Organize your opportunities across pipeline stages, follow-up deadlines, and next actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-neutralLight p-1 rounded-btn flex items-center gap-1 border border-borderStandard text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition ${
                viewMode === 'board' ? 'bg-white text-carbon shadow-xs font-semibold' : 'text-textMuted hover:text-carbon'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition ${
                viewMode === 'table' ? 'bg-white text-carbon shadow-xs font-semibold' : 'text-textMuted hover:text-carbon'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button variant="primary" size="md" icon={Plus} onClick={() => setModalOpen(true)}>
            Add Application
          </Button>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STAGES.map((s) => {
            const stageApps = applications.filter(a => a.stage === s.id);
            return (
              <div key={s.id} className="w-72 shrink-0 flex flex-col space-y-3">
                <div className={`p-3 rounded-standard bg-white border border-borderStandard border-t-4 ${s.color} shadow-xs flex items-center justify-between`}>
                  <span className="font-headline font-bold text-xs text-carbon">{s.label}</span>
                  <Badge variant="neutral" size="sm">{stageApps.length}</Badge>
                </div>

                <div className="space-y-3 min-h-[300px] bg-neutralLight/30 p-2 rounded-standard border border-dashed border-borderStandard">
                  {stageApps.map((app) => (
                    <Card key={app.id} className="p-4 space-y-2.5 bg-white border-borderStandard shadow-xs hover:border-borderStrong transition text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-headline font-bold text-carbon text-sm">{app.role}</h4>
                          <p className="text-[11px] text-textMuted">{app.company} • {app.location}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-textDisabled hover:text-semanticError"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {app.notes && (
                        <p className="text-[11px] text-textSecondary bg-neutralLight/40 p-2 rounded">
                          {app.notes}
                        </p>
                      )}

                      {app.next_action && (
                        <div className="text-[10px] text-burnt font-semibold flex items-center gap-1">
                          <span>Next:</span>
                          <span className="truncate">{app.next_action}</span>
                        </div>
                      )}

                      {/* Stage Mover Selector */}
                      <div className="pt-2 border-t border-borderStandard flex items-center justify-between text-[11px]">
                        <span className="text-textMuted">Move stage:</span>
                        <select
                          value={app.stage}
                          onChange={(e) => handleStageChange(app.id, e.target.value)}
                          className="bg-neutralLight border border-borderStandard rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                        >
                          {STAGES.map(st => (
                            <option key={st.id} value={st.id}>{st.label}</option>
                          ))}
                        </select>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutralLight/60 text-textMuted uppercase text-[10px] font-bold tracking-wider border-b border-borderStandard">
                <tr>
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Stage</th>
                  <th className="py-3 px-6">Next Action</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderStandard">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-neutralLight/20 transition">
                    <td className="py-3.5 px-6 font-bold text-carbon">{app.company}</td>
                    <td className="py-3.5 px-6 text-textSecondary">{app.role}</td>
                    <td className="py-3.5 px-6 text-textMuted">{app.location}</td>
                    <td className="py-3.5 px-6">
                      <select
                        value={app.stage}
                        onChange={(e) => handleStageChange(app.id, e.target.value)}
                        className="bg-white border border-borderStandard rounded px-2 py-1 text-xs"
                      >
                        {STAGES.map(st => (
                          <option key={st.id} value={st.id}>{st.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-6 text-textSecondary">{app.next_action || '—'}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-textMuted hover:text-semanticError"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Application Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Track New Job Opportunity"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateApplication}>
              Save Opportunity
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateApplication} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, Acme Corp"
              required
            />
            <Input
              label="Role Title"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Backend Engineer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, Austin TX"
            />
            <Input
              label="Salary Range (Optional)"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $90k - $110k"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
              Initial Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-standard border border-borderStandard px-3 py-2 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Next Actionable Step"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="e.g. Fine-tune resume bullets, follow-up with recruiter"
          />

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
              Application Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-standard border border-borderStandard p-2.5 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
              placeholder="Key requirements, referral contacts, or interview dates..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
