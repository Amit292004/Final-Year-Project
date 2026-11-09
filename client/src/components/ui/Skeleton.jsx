import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-card bg-neutralLight/80 border border-borderStandard/40', className)}
      {...props}
    />
  );
}
