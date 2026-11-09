import React from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-borderStandard rounded-card bg-white/70 shadow-subtle',
      className
    )}>
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-peach flex items-center justify-center text-burnt mb-4 shadow-subtle border border-orange-200/80 animate-fadeIn">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="font-headline font-bold text-lg text-carbon mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-textSecondary max-w-md mb-6 leading-relaxed">{description}</p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} variant="primary" size="md">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline" size="md">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
