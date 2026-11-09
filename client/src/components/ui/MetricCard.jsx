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
      'relative overflow-hidden group hover:border-surfaceBorder/80 transition-all duration-200 tactile-card',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-mono font-semibold text-secondary uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="font-headline font-black text-2xl sm:text-3xl text-foreground tracking-tight leading-none pt-0.5">
            {value}
          </div>
          
          {(subtext || trend !== undefined) && (
            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium pt-1">
              {trend !== undefined && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 font-bold font-mono text-[11px] px-1.5 py-0.5 rounded',
                  isPositiveTrend && 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30',
                  isNegativeTrend && 'text-red-400 bg-red-500/15 border border-red-500/30',
                  !isPositiveTrend && !isNegativeTrend && 'text-secondary bg-surface'
                )}>
                  {isPositiveTrend && <TrendingUp className="w-3 h-3" />}
                  {isNegativeTrend && <TrendingDown className="w-3 h-3" />}
                  {isPositiveTrend ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {subtext && <span className="truncate text-secondary text-[11px]">{subtext}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div className="iconBox group-hover:border-brandOrange group-hover:text-brandOrange group-hover:scale-105 transition-all duration-200 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
