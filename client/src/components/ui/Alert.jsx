import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Alert({
  variant = 'info', // info, success, warning, error
  title,
  children,
  onClose,
  className = ''
}) {
  const variants = {
    info: {
      wrapper: 'bg-neutralLight/60 border-borderStandard text-carbon',
      icon: Info,
      iconColor: 'text-textSecondary'
    },
    success: {
      wrapper: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600'
    },
    warning: {
      wrapper: 'bg-amber-50/70 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    error: {
      wrapper: 'bg-red-50/70 border-red-200 text-red-900',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    }
  };

  const current = variants[variant] || variants.info;
  const Icon = current.icon;

  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-card border flex items-start gap-3 text-xs leading-relaxed transition-all shadow-subtle',
        current.wrapper,
        className
      )}
    >
      <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', current.iconColor)} />
      
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="font-bold text-xs uppercase tracking-wide">{title}</h4>}
        <div className="text-xs">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-textMuted hover:text-carbon p-1 rounded -mr-1 -mt-1 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
