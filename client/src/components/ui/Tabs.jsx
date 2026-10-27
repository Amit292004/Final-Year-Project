import React from 'react';

export function Tabs({
  tabs = [], // [{ id, label, icon: Icon, count }]
  activeTab,
  onChange,
  className = ''
}) {
  return (
    <div className={`border-b border-borderStandard flex items-center gap-2 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
              isActive
                ? 'border-signature text-burnt font-semibold'
                : 'border-transparent text-textSecondary hover:text-carbon hover:border-borderStrong'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-signature' : 'text-textMuted'}`} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-peach text-burnt font-bold' : 'bg-neutralLight text-textMuted'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
