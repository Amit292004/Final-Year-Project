import React from 'react';
import { Card } from './Card';

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  className = ''
}) {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">{title}</p>
          <div className="font-headline font-extrabold text-2xl sm:text-3xl text-carbon tracking-tight">
            {value}
          </div>
          {subtext && (
            <p className="text-xs text-textSecondary flex items-center gap-1 font-medium pt-0.5">
              {trend && (
                <span className={`font-semibold ${trend > 0 ? 'text-semanticSuccess' : 'text-textMuted'}`}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {subtext}
            </p>
          )}
        </div>

        {Icon && (
          <div className="p-2.5 rounded-standard bg-peach text-burnt shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
