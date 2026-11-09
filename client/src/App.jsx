import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ResumeLibraryPage } from './pages/resume/ResumeLibraryPage';
import { ResumeEditorPage } from './pages/resume/ResumeEditorPage';
import { AssessmentReportPage } from './pages/resume/AssessmentReportPage';
import { AtsScorerPage } from './pages/resume/AtsScorerPage';
import { JobMatchingPage } from './pages/matching/JobMatchingPage';
import { SkillGapPage } from './pages/skills/SkillGapPage';
import { LearningRoadmapPage } from './pages/roadmap/LearningRoadmapPage';
import { MockInterviewPage } from './pages/interview/MockInterviewPage';
import { CareerAdvisorPage } from './pages/advisor/CareerAdvisorPage';
import { JobTrackerPage } from './pages/tracker/JobTrackerPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-signature border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-textMuted uppercase tracking-wider">Verifying Session...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#171717',
              color: '#FFFFFF',
              fontSize: '13px',
              borderRadius: '9px',
              padding: '10px 14px',
              border: '1px solid #262626',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              fontFamily: 'Inter, system-ui, sans-serif'
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        <Routes>
          {/* Public marketing pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Authentication screens */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Onboarding Wizard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingWizard />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Candidate & Admin App Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resumes" element={<ResumeLibraryPage />} />
            <Route path="/ats-scorer" element={<AtsScorerPage />} />
            <Route path="/resumes/:resumeId/edit" element={<ResumeEditorPage />} />
            <Route path="/resumes/:resumeId/assessment" element={<AssessmentReportPage />} />
            <Route path="/matching" element={<JobMatchingPage />} />
            <Route path="/skills" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<LearningRoadmapPage />} />
            <Route path="/interview" element={<MockInterviewPage />} />
            <Route path="/advisor" element={<CareerAdvisorPage />} />
            <Route path="/tracker" element={<JobTrackerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
