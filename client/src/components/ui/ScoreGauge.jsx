import React from 'react';

export function ScoreGauge({
  score = 0,
  maxScore = 100,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
  sublabel
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.max(0, Math.min(score, maxScore));
  const strokeDashoffset = circumference - (normalizedScore / maxScore) * circumference;

  let strokeColor = '#F97316'; // signature orange
  let levelText = 'Improvement Recommended';

  if (normalizedScore >= 80) {
    strokeColor = '#15803D'; // success green
    levelText = 'Strong Readiness';
  } else if (normalizedScore < 60) {
    strokeColor = '#B42318'; // error red
    levelText = 'Significant Improvements Needed';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E7E5E4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline font-extrabold text-3xl sm:text-4xl text-carbon tracking-tight">
            {normalizedScore}
          </span>
          <span className="text-[11px] font-semibold text-textMuted uppercase tracking-wider">
            / {maxScore}
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-3">
          <div className="text-xs font-bold uppercase tracking-wider text-carbon">
            {sublabel || levelText}
          </div>
        </div>
      )}
    </div>
  );
}
