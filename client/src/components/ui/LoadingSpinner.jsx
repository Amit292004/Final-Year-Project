import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoadingSpinner({
  label = 'Loading...',
  subtext,
  size = 'md',
  fullScreen = false,
  className = ''
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center p-6 space-y-3 text-center select-none', className)}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-peach animate-ping opacity-40" />
        <Loader2 className={cn(sizes[size] || sizes.md, 'animate-spin text-signature relative z-10')} />
      </div>
      {label && <p className="text-xs sm:text-sm font-bold text-carbon tracking-tight">{label}</p>}
      {subtext && <p className="text-xs text-textMuted max-w-xs">{subtext}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
