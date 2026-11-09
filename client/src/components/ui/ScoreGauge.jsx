import React, { useId } from 'react';
import { cn } from '../../lib/utils';

export function ScoreGauge({
  score = 0,
  maxScore = 100,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
  sublabel,
  className = ''
}) {
  const gradientId = useId().replace(/:/g, '');
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.max(0, Math.min(Number(score) || 0, maxScore));
  const progressRatio = normalizedScore / (maxScore || 100);
  const strokeDashoffset = circumference - progressRatio * circumference;

  let colorConfig = {
    start: '#F97316',
    end: '#EA580C',
    levelText: 'Improvement Recommended',
    badgeClass: 'bg-peach text-burnt border-orange-200'
  };

  if (normalizedScore >= 80) {
    colorConfig = {
      start: '#10B981',
      end: '#059669',
      levelText: 'Strong Readiness',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  } else if (normalizedScore < 60) {
    colorConfig = {
      start: '#EF4444',
      end: '#DC2626',
      levelText: 'Needs Optimization',
      badgeClass: 'bg-red-50 text-red-700 border-red-200'
    };
  }

  // Dynamic typography based on size
  const numberFontSize = Math.max(18, Math.round(size * 0.24));
  const sublabelFontSize = Math.max(10, Math.round(size * 0.08));

  return (
    <div className={cn('flex flex-col items-center justify-center text-center select-none', className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={`gauge-grad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorConfig.start} />
              <stop offset="100%" stopColor={colorConfig.end} />
            </linearGradient>
            <filter id={`gauge-shadow-${gradientId}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#gauge-grad-${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#gauge-shadow-${gradientId})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="font-headline font-black text-foreground tracking-tight leading-none"
            style={{ fontSize: `${numberFontSize}px` }}
          >
            {Math.round(normalizedScore)}
          </span>
          <span
            className="font-semibold text-secondary uppercase tracking-wider mt-1"
            style={{ fontSize: `${sublabelFontSize}px` }}
          >
            / {maxScore}
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-3 space-y-1">
          <span className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase',
            colorConfig.badgeClass
          )}>
            {sublabel || colorConfig.levelText}
          </span>
        </div>
      )}
    </div>
  );
}
