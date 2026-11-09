import React, { useState, useEffect } from 'react';

/**
 * AnimatedNumber - Ported directly from Bounce Back Academy's HeroSection.
 * Smoothly interpolates an integer count across 40 frames for authentic, tactile metrics.
 */
export function AnimatedNumber({
  value = 0,
  suffix = '+',
  prefix = '',
  duration = 1200,
  isLoading = false,
  className = ''
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (isLoading || value === 0) {
      setDisplayed(value);
      return;
    }

    const steps = 40;
    const stepDuration = Math.max(16, duration / steps);
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration, isLoading]);

  if (isLoading) {
    return <span className="skeleton inline-block w-12 h-6 rounded" />;
  }

  return (
    <span className={className}>
      {prefix}
      {displayed.toLocaleString()}
      {suffix}
    </span>
  );
}
