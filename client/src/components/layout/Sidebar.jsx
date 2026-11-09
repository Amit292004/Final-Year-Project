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
    <div className="flex flex-col h-full bg-obsidian text-foreground w-64 select-none border-r border-surfaceBorder">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-surfaceBorder">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-btn bg-brandOrange flex items-center justify-center text-white font-headline font-black text-lg shadow-sm">
            C
          </div>
          <span className="font-headline font-black text-lg tracking-tight text-foreground">
            CareerFit<span className="text-brandOrange">.AI</span>
          </span>
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-secondary hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group, groupIdx) => (
          <div key={group.label} className={`space-y-1 ${groupIdx > 0 ? 'pt-3 border-t border-surfaceBorder' : ''}`}>
            <div className="px-3 text-[10px] font-mono font-semibold text-textMuted uppercase tracking-[0.18em] mb-1.5 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brandOrange" />
              <span>{group.label}</span>
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2 text-xs rounded-btn transition-all duration-150 ease-custom-out relative ${
                      isActive
                        ? 'bg-surfaceCard text-foreground font-semibold shadow-sm border border-surfaceBorder'
                        : 'text-secondary hover:text-foreground hover:bg-surface'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 rounded-r-sm bg-brandOrange shadow-glow-orange" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ease-custom-out group-hover:scale-110 ${isActive ? 'text-brandOrange' : 'text-textMuted group-hover:text-foreground'}`} />
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
      <div className="p-3 border-t border-surfaceBorder bg-surface">
        <div className="flex items-center justify-between p-2.5 rounded-btn bg-surfaceCard border border-surfaceBorder hover:border-surfaceBorder/80 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brandOrangeLight border border-brandOrangeBorder text-brandOrange font-bold text-xs flex items-center justify-center shrink-0">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.user_metadata?.full_name || 'Candidate User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-textMuted font-mono uppercase tracking-wider">Academic Tier</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded hover:bg-surface text-secondary hover:text-brandOrange transition-colors ml-1 shrink-0"
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
