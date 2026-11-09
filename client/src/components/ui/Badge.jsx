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
    orange: 'bg-peach text-burnt border border-orange-200/90 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    error: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
    neutral: 'bg-neutralLight text-textSecondary border border-borderStandard font-medium',
    carbon: 'bg-carbon text-white font-medium border border-graphite',
    blue: 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200 font-semibold'
  };

  const dotColors = {
    orange: 'bg-burnt',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    neutral: 'bg-textMuted',
    carbon: 'bg-signature',
    blue: 'bg-sky-500',
    purple: 'bg-purple-500'
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
