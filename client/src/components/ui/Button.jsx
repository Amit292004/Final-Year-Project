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
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 haptic-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian disabled:opacity-50 disabled:pointer-events-none select-none rounded-btn';

  const variants = {
    primary: 'bg-brandOrange hover:bg-brandOrangeHover text-white focus-visible:ring-brandOrange shadow-sm hover:shadow-glow-orange border border-transparent',
    white: 'bg-foreground text-background hover:bg-gray-200 focus-visible:ring-white shadow-sm border border-transparent font-bold',
    secondary: 'bg-surface hover:bg-surfaceCard text-foreground focus-visible:ring-surfaceBorder border border-surfaceBorder shadow-sm',
    outline: 'border border-surfaceBorder bg-surface/80 text-foreground hover:bg-surfaceCard hover:border-surfaceBorder focus-visible:ring-surfaceBorder shadow-sm',
    ghost: 'text-secondary hover:text-foreground hover:bg-surface focus-visible:ring-surfaceBorder border border-transparent',
    danger: 'bg-semanticError hover:bg-red-700 text-white focus-visible:ring-semanticError shadow-sm border border-transparent',
    subtle: 'bg-brandOrangeLight text-brandOrange border border-brandOrangeBorder hover:bg-orange-950/40 focus-visible:ring-brandOrange font-semibold',
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
