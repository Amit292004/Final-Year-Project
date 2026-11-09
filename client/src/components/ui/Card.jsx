import React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  children,
  className = '',
  interactive = false,
  padded = true,
  variant = 'default', // default, elevated, tactile, accent, glass, dark
  ...props
}) {
  const variants = {
    default: 'bg-surface border-surfaceBorder text-foreground shadow-sm',
    elevated: 'premium-card',
    tactile: 'tactile-card',
    accent: 'bg-surface border-surfaceBorder border-t-2 border-t-brandOrange shadow-sm',
    glass: 'glass-panel',
    dark: 'bg-surfaceCard text-foreground border-surfaceBorder'
  };

  return (
    <div
      className={cn(
        'rounded-card border transition-all duration-150',
        variants[variant] || variants.default,
        interactive && 'tactile-card cursor-pointer',
        padded && 'p-5 sm:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4 border-b border-surfaceBorder', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={cn('font-headline font-bold text-base sm:text-lg text-foreground tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={cn('text-xs sm:text-sm text-secondary leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={cn('flex items-center pt-4 border-t border-surfaceBorder', className)} {...props}>
      {children}
    </div>
  );
}
