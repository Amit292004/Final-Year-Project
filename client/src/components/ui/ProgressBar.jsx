import React from 'react';
import { cn } from '../../lib/utils';

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  sublabel,
  color = 'bg-signature',
  variant, // signature, emerald, amber, red
  height = 'h-2.5',
  showPercentage = false,
  className = ''
}) {
  const safeMax = Math.max(1, Number(max) || 100);
  const safeVal = Math.max(0, Number(value) || 0);
  const pct = Math.min(100, Math.round((safeVal / safeMax) * 100));

  const variantGradients = {
    signature: 'bg-gradient-to-r from-signature to-burnt',
    emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    amber: 'bg-gradient-to-r from-amber-500 to-amber-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600'
  };

  const fillClass = variant ? variantGradients[variant] || color : color;

  return (
    <div className={cn('w-full space-y-1.5 select-none', className)}>
      {(label || sublabel || showPercentage) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-carbon tracking-tight">{label}</span>}
          <div className="flex items-center gap-1.5 ml-auto text-textMuted font-mono text-[11px]">
            {sublabel && <span>{sublabel}</span>}
            {showPercentage && <span className="font-bold text-carbon">{pct}%</span>}
          </div>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-borderStandard/60 rounded-full overflow-hidden p-0.5 border border-borderStandard/40 shadow-inner',
        height
      )}>
        <div
          className={cn(
            fillClass,
            'h-full rounded-full transition-all duration-700 ease-out shadow-sm'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
