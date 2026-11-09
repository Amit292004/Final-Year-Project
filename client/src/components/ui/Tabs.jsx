import React from 'react';
import { cn } from '../../lib/utils';

export function Tabs({
  tabs = [], // [{ id, label, icon: Icon, count }]
  activeTab,
  onChange,
  variant = 'underline', // 'underline' | 'pills'
  className = ''
}) {
  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1.5 p-1 bg-neutralLight/80 rounded-card border border-borderStandard overflow-x-auto', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 py-1.5 px-3.5 text-xs font-bold rounded-btn transition-all whitespace-nowrap select-none',
                isActive
                  ? 'bg-white text-carbon shadow-subtle border border-borderStandard/60'
                  : 'text-textSecondary hover:text-carbon hover:bg-white/50'
              )}
            >
              {Icon && <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-signature' : 'text-textMuted')} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
                  isActive ? 'bg-peach text-burnt' : 'bg-borderStandard/60 text-textMuted'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant (default)
  return (
    <div className={cn('border-b border-borderStandard flex items-center gap-1 overflow-x-auto select-none', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap -mb-px',
              isActive
                ? 'border-signature text-burnt bg-peach/10'
                : 'border-transparent text-textSecondary hover:text-carbon hover:border-borderStrong'
            )}
          >
            {Icon && <Icon className={cn('w-4 h-4', isActive ? 'text-signature' : 'text-textMuted')} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors',
                isActive ? 'bg-peach text-burnt' : 'bg-neutralLight text-textMuted'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
