import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  sublabel,
  color = 'bg-signature',
  height = 'h-2',
  className = ''
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-textPrimary">{label}</span>}
          {sublabel ? (
            <span className="text-textMuted">{sublabel}</span>
          ) : (
            <span className="font-semibold text-carbon">{pct}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-borderStandard/60 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
