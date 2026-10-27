import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-btn';

  const variants = {
    primary: 'bg-signature hover:bg-burnt text-white focus:ring-signature shadow-sm hover:shadow',
    secondary: 'bg-carbon hover:bg-graphite text-white focus:ring-carbon shadow-sm',
    outline: 'border border-borderStrong bg-white text-carbon hover:bg-neutralLight focus:ring-carbon shadow-sm',
    ghost: 'text-textSecondary hover:text-carbon hover:bg-neutralLight focus:ring-carbon',
    danger: 'bg-semanticError hover:opacity-90 text-white focus:ring-semanticError shadow-sm'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-2.5 gap-2.5 h-12'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
