import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/apiClient';

export function Topbar({ onMenuClick }) {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    apiRequest('/notifications')
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {});
  }, [location.pathname]);

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
      default: return 'CareerFit AI';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-borderStandard px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-btn text-textSecondary hover:bg-neutralLight"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-textMuted uppercase tracking-wider hidden sm:inline">
            Platform /
          </span>
          <h1 className="font-headline font-bold text-base sm:text-lg text-carbon">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Pro status badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-peach border border-orange-200 text-burnt text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-signature" />
          <span>Pro AI Access</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-btn text-textSecondary hover:text-carbon hover:bg-neutralLight transition relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-signature rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-standard border border-borderStandard shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
                <span className="font-headline font-bold text-sm text-carbon">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-signature hover:text-burnt font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-borderStandard max-h-80 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-6">No recent notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`py-3 ${n.is_read ? 'opacity-70' : 'bg-peach/30 -mx-2 px-2 rounded'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-semibold text-carbon">{n.title}</p>
                        <span className="text-[10px] text-textMuted shrink-0">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-textSecondary mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
