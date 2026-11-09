import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Briefcase,
  Target,
  Map,
  MessagesSquare,
  Bot,
  KanbanSquare,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'CAREER',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'ATS Resume Scorer', path: '/ats-scorer', icon: FileCheck },
        { label: 'Resume Intelligence', path: '/resumes', icon: FileText },
        { label: 'Job Matching', path: '/matching', icon: Briefcase },
        { label: 'Skill Gap Analysis', path: '/skills', icon: Target },
        { label: 'Learning Roadmap', path: '/roadmap', icon: Map }
      ]
    },
    {
      label: 'PREPARATION',
      items: [
        { label: 'Interview Preparation', path: '/interview', icon: MessagesSquare },
        { label: 'AI Career Advisor', path: '/advisor', icon: Bot }
      ]
    },
    {
      label: 'APPLICATIONS',
      items: [
        { label: 'Job Tracker', path: '/tracker', icon: KanbanSquare },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 }
      ]
    },
    {
      label: 'ACCOUNT',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Admin Workspace', path: '/admin', icon: Shield }
      ]
    }
  ];

  const content = (
    <div className="flex flex-col h-full bg-carbon text-white w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-graphite">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-btn bg-signature flex items-center justify-center text-white font-headline font-black text-lg shadow-sm">
            C
          </div>
          <span className="font-headline font-extrabold text-lg tracking-tight text-white">
            CareerFit<span className="text-signature">.AI</span>
          </span>
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-textDisabled hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-textDisabled uppercase tracking-widest mb-2">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-btn transition-colors relative ${
                      isActive
                        ? 'bg-graphite text-white font-semibold'
                        : 'text-gray-300 hover:text-white hover:bg-graphite/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-signature" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-signature' : 'text-textDisabled'}`} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-graphite bg-carbon">
        <div className="flex items-center justify-between p-2 rounded-btn bg-graphite/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-signature/20 border border-signature/40 text-signature font-bold text-xs flex items-center justify-center shrink-0">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.user_metadata?.full_name || 'Candidate User'}
              </p>
              <p className="text-[11px] text-textDisabled truncate">
                {user?.email || 'candidate@careerfit.ai'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded hover:bg-graphite text-textDisabled hover:text-burnt transition"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 border-r border-graphite">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-carbon/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
