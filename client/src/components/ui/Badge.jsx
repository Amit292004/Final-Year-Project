import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // orange, success, warning, error, neutral, carbon
  size = 'md', // sm, md
  className = ''
}) {
  const variants = {
    orange: 'bg-peach text-burnt border border-orange-200 font-semibold',
    success: 'bg-semanticSuccessBg text-semanticSuccess border border-green-200 font-medium',
    warning: 'bg-amber-50 text-semanticWarning border border-amber-200 font-medium',
    error: 'bg-semanticErrorBg text-semanticError border border-red-200 font-medium',
    neutral: 'bg-neutralLight text-textSecondary border border-borderStandard font-medium',
    carbon: 'bg-carbon text-white font-medium'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 shrink-0 ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
}
