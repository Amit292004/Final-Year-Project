import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sparkles, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { apiRequest } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';

export function Topbar({ onMenuClick }) {
  const location = useLocation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    apiRequest('/notifications')
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {});
  }, [location.pathname]);

  // Handle click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifs]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  // Compute breadcrumb title from path
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Career Dashboard';
      case '/ats-scorer': return 'ATS Resume Scorer';
      case '/resumes': return 'Resume Intelligence';
      case '/matching': return 'Semantic Job Matching';
      case '/skills': return 'Skill Gap Analysis';
      case '/roadmap': return 'Learning Roadmap';
      case '/interview': return 'AI Interview Preparation';
      case '/advisor': return 'AI Career Advisor';
      case '/tracker': return 'Application Pipeline Tracker';
      case '/analytics': return 'Career Analytics';
      case '/settings': return 'Account & Privacy Settings';
      case '/admin': return 'Administrator Operations';
      default: return 'Career Intelligence';
    }
  };

  const candidateInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'C';

  return (
    <header className="h-16 bg-obsidian/85 backdrop-blur-md border-b border-surfaceBorder px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-btn text-secondary hover:text-foreground hover:bg-surface transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-textMuted uppercase tracking-wider hidden sm:inline">
            Workspace
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-textMuted hidden sm:inline" />
          <h1 className="font-headline font-bold text-base sm:text-lg text-foreground">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live System Status Chip (Bounce Back Academy Live Indicator) */}
        <div className="liveChip hidden sm:inline-flex py-1 px-3">
          <span className="liveDot" />
          <span className="text-xs font-mono font-medium text-foreground">Engine Ready</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-btn text-secondary hover:text-foreground hover:bg-surface transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brandOrange rounded-full ring-2 ring-obsidian" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surfaceCard rounded-card border border-surfaceBorder shadow-elevated z-50 p-4 animate-zoomIn95">
              <div className="flex items-center justify-between pb-3 border-b border-surfaceBorder">
                <span className="font-headline font-bold text-sm text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-brandOrange hover:text-brandOrangeHover font-semibold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-surfaceBorder max-h-80 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-6">No recent notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`py-3 ${n.is_read ? 'opacity-60' : 'bg-surface -mx-2 px-2.5 rounded-card'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <span className="text-[10px] text-textMuted shrink-0 font-mono">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Quick Link */}
        <Link
          to="/settings"
          className="w-8 h-8 rounded-full bg-brandOrangeLight border border-brandOrangeBorder text-brandOrange font-bold text-xs flex items-center justify-center hover:scale-105 transition-transform"
          title="Account Settings"
        >
          {candidateInitial}
        </Link>
      </div>
    </header>
  );
}
