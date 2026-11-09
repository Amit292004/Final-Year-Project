import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  FileText,
  Trash2,
  Edit3,
  BarChart3,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { apiRequest } from '../../lib/apiClient';

export function ResumeLibraryPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [resumeTitle, setResumeTitle] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const loadResumes = async () => {
    try {
      const data = await apiRequest('/resumes');
      setResumes(data.resumes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setUploadError('File exceeds 5 MB maximum size limit.');
        return;
      }
      setFile(selected);
      setResumeTitle(selected.name.replace(/\.[^/.]+$/, ''));
      setUploadError('');
    }
  };

  const handleUpload = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!file) {
      setUploadError('Please select a PDF or DOCX resume file.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('title', resumeTitle || file.name);
      formData.append('target_role', targetRole);

      await apiRequest('/resumes/upload', {
        method: 'POST',
        body: formData
      });

      setUploadModalOpen(false);
      setFile(null);
      await loadResumes();
      toast.success('Resume uploaded and parsed successfully!');
    } catch (err) {
      const msg = err.message || 'Failed to upload and parse resume.';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await apiRequest(`/resumes/${id}`, { method: 'DELETE' });
      setResumes(resumes.filter(r => r.id !== id));
      toast.success('Resume deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete resume.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borderStandard">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-carbon">Resume Intelligence</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Manage your parsed documents, run 100-point ATS assessments, and review AI rewrites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/ats-scorer">
            <Button variant="outline" size="md" icon={BarChart3}>
              ATS Scorer & Diagnostics
            </Button>
          </Link>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setUploadModalOpen(true)}>
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Resume Grid or Empty State */}
      {resumes.length === 0 && !loading ? (
        <EmptyState
          icon={FileText}
          title="No Resumes Uploaded Yet"
          description="Upload your current resume in PDF or DOCX format to receive instant ATS formatting scores, keyword coverage analysis, and Google X-Y-Z rewrites."
          actionLabel="Upload First Resume"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const wordCount = resume.parsed_data?.word_count || 0;
            const skillsCount = resume.parsed_data?.skills?.length || 0;

            return (
              <Card key={resume.id} className="flex flex-col justify-between space-y-4 hover:border-borderStrong transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-btn bg-peach text-burnt shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-headline font-bold text-sm text-carbon truncate">
                          {resume.title}
                        </h3>
                        <p className="text-[11px] text-textMuted uppercase font-semibold">
                          {resume.file_type} • {resume.target_role}
                        </p>
                      </div>
                    </div>
                    <Badge variant={resume.status === 'parsed' ? 'success' : 'neutral'} size="sm">
                      {resume.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-borderStandard bg-neutralLight/30 rounded p-2">
                    <div>
                      <span className="text-textMuted block text-[10px] uppercase font-semibold">Word Count</span>
                      <span className="font-bold text-carbon">{wordCount} words</span>
                    </div>
                    <div>
                      <span className="text-textMuted block text-[10px] uppercase font-semibold">Skills Extracted</span>
                      <span className="font-bold text-carbon">{skillsCount} skills</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Link to={`/resumes/${resume.id}/edit`}>
                      <Button variant="outline" size="sm" icon={Edit3}>
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/resumes/${resume.id}/assessment`}>
                      <Button variant="primary" size="sm" icon={BarChart3}>
                        Score Report
                      </Button>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-1.5 rounded text-textMuted hover:text-semanticError hover:bg-neutralLight transition"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Resume Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Resume for Analysis"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={uploading} onClick={handleUpload}>
              Start Analysis
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-btn bg-semanticErrorBg text-semanticError text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-surfaceBorder rounded-standard p-6 text-center hover:border-brandOrange bg-surface/50 transition cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-8 h-8 text-signature mx-auto mb-2" />
            <p className="text-xs font-bold text-carbon">
              {file ? file.name : 'Click or drag PDF / DOCX resume file here'}
            </p>
            <p className="text-[11px] text-textMuted mt-1">
              Supports PDF and DOCX up to 5 MB initial limit.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
              Resume Label / Title
            </label>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="e.g. Software Engineer 2026 Edition"
              className="w-full rounded-standard border border-borderStandard px-3 py-2 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
              Target Technical Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-standard border border-borderStandard px-3 py-2 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI / ML Engineer">AI / ML Engineer</option>
            </select>
          </div>

          <p className="text-[11px] text-textMuted bg-neutralLight/40 p-2.5 rounded">
            <strong>Privacy Note:</strong> Your resume is encrypted in private storage. Our parser checks for unnecessary personal information (e.g. street addresses) to advise you on modern ATS privacy.
          </p>
        </form>
      </Modal>
    </div>
  );
}
