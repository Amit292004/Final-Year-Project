import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  children,
  variant = 'neutral', // orange, success, warning, error, neutral, carbon, blue, purple
  size = 'md', // xs, sm, md
  dot = false,
  dotPulse = false,
  icon: Icon,
  className = ''
}) {
  const variants = {
    orange: 'bg-brandOrange/15 text-brandOrange border border-brandOrangeBorder font-semibold',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold',
    error: 'bg-red-500/15 text-red-400 border border-red-500/30 font-semibold',
    neutral: 'bg-surfaceCard text-secondary border border-surfaceBorder font-medium',
    carbon: 'bg-surface text-foreground font-medium border border-surfaceBorder',
    blue: 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold'
  };

  const dotColors = {
    orange: 'bg-brandOrange',
    success: 'bg-emerald-400',
    emerald: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    neutral: 'bg-muted',
    carbon: 'bg-brandOrange',
    blue: 'bg-sky-400',
    purple: 'bg-purple-400'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1 rounded-full tracking-wide',
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 rounded-full',
    md: 'text-xs px-3 py-1 gap-1.5 rounded-full'
  };

  return (
    <span className={cn(
      'inline-flex items-center shrink-0 tracking-normal transition-colors select-none',
      variants[variant] || variants.neutral,
      sizes[size] || sizes.md,
      className
    )}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          dotColors[variant] || dotColors.neutral,
          dotPulse && 'animate-pulse'
        )} />
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
