import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger, subtle, emerald
  size = 'md', // xs, sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-btn active:scale-[0.98]';

  const variants = {
    primary: 'bg-signature hover:bg-burnt text-white focus-visible:ring-signature shadow-sm hover:shadow-soft hover:shadow-signature/20 border border-transparent',
    secondary: 'bg-carbon hover:bg-graphite text-white focus-visible:ring-carbon shadow-sm border border-graphite/40',
    outline: 'border border-borderStrong bg-white text-carbon hover:bg-neutralLight hover:border-carbon/30 focus-visible:ring-carbon shadow-subtle',
    ghost: 'text-textSecondary hover:text-carbon hover:bg-neutralLight/80 focus-visible:ring-carbon border border-transparent',
    danger: 'bg-semanticError hover:bg-red-700 text-white focus-visible:ring-semanticError shadow-sm border border-transparent',
    subtle: 'bg-peach hover:bg-orange-100 text-burnt border border-orange-200/80 focus-visible:ring-signature font-semibold',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-600 shadow-sm border border-transparent'
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 h-7 gap-1',
    sm: 'text-xs px-3 h-8 gap-1.5',
    md: 'text-sm px-4 h-10 gap-2',
    lg: 'text-base px-6 h-12 gap-2.5'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const currentIconSize = iconSizes[size] || iconSizes.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn(currentIconSize, 'animate-spin shrink-0')} />
      ) : Icon ? (
        <Icon className={cn(currentIconSize, 'shrink-0')} />
      ) : null}
      
      {typeof children === 'string' || typeof children === 'number' ? (
        <span>{children}</span>
      ) : (
        children
      )}

      {!loading && IconRight ? (
        <IconRight className={cn(currentIconSize, 'shrink-0')} />
      ) : null}
    </button>
  );
}
