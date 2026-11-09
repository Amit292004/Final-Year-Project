import React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  children,
  className = '',
  interactive = false,
  padded = true,
  variant = 'default', // default, elevated, accent, glass, dark
  ...props
}) {
  const variants = {
    default: 'bg-white border-borderStandard shadow-subtle',
    elevated: 'bg-white border-borderStandard shadow-soft hover:shadow-elevated transition-shadow duration-200',
    accent: 'bg-white border-borderStandard border-t-4 border-t-signature shadow-subtle',
    glass: 'glass-panel shadow-soft',
    dark: 'bg-carbon text-white border-graphite shadow-soft'
  };

  return (
    <div
      className={cn(
        'rounded-card border transition-all duration-200',
        variants[variant] || variants.default,
        interactive && 'hover:border-borderStrong hover:shadow-soft hover:-translate-y-0.5 cursor-pointer',
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
    <div className={cn('flex flex-col space-y-1.5 pb-4 border-b border-borderStandard', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={cn('font-headline font-bold text-base sm:text-lg text-carbon tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={cn('text-xs sm:text-sm text-textSecondary leading-relaxed', className)} {...props}>
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
    <div className={cn('flex items-center pt-4 border-t border-borderStandard', className)} {...props}>
      {children}
    </div>
  );
}
