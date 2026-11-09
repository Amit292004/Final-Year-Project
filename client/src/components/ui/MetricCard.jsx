import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  className = ''
}) {
  const isPositiveTrend = typeof trend === 'number' && trend > 0;
  const isNegativeTrend = typeof trend === 'number' && trend < 0;

  return (
    <Card className={cn(
      'relative overflow-hidden group hover:border-borderStrong transition-all duration-200',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-bold text-textMuted uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="font-headline font-black text-2xl sm:text-3xl text-carbon tracking-tight leading-none pt-0.5">
            {value}
          </div>
          
          {(subtext || trend !== undefined) && (
            <div className="flex items-center gap-1.5 text-xs text-textSecondary font-medium pt-1">
              {trend !== undefined && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded',
                  isPositiveTrend && 'text-emerald-700 bg-emerald-50 border border-emerald-200',
                  isNegativeTrend && 'text-red-700 bg-red-50 border border-red-200',
                  !isPositiveTrend && !isNegativeTrend && 'text-textMuted bg-neutralLight'
                )}>
                  {isPositiveTrend && <TrendingUp className="w-3 h-3" />}
                  {isNegativeTrend && <TrendingDown className="w-3 h-3" />}
                  {isPositiveTrend ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {subtext && <span className="truncate text-textSecondary text-[11px]">{subtext}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div className="p-3 rounded-card bg-peach text-burnt group-hover:scale-105 transition-transform duration-200 shrink-0 border border-orange-200/60 shadow-subtle">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
