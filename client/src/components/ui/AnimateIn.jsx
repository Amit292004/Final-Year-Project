import React from 'react';
import { cn } from '../../lib/utils';

/**
 * AnimateIn - Lightweight entrance animation wrapper component.
 * Uses pure CSS animation without requiring heavy JS animation libraries.
 * Automatically respects prefers-reduced-motion.
 *
 * @param {number} delay - Stagger multiplier (e.g. 0 = 0ms, 1 = 60ms, 2 = 120ms, 3 = 180ms)
 * @param {string} direction - 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Children to animate
 * @param {string} as - HTML tag to render (default: 'div')
 */
export function AnimateIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const directionClasses = {
    up: 'animate-fade-up',
    down: 'animate-fade-down',
    left: 'animate-slide-in-from-left',
    scale: 'animate-zoom-in-95',
    fade: 'animate-fade-in'
  };

  const animationClass = directionClasses[direction] || directionClasses.up;
  const delayMs = Math.max(0, delay * 60);

  return (
    <Component
      className={cn(animationClass, className)}
      style={{
        animationDelay: delayMs > 0 ? `${delayMs}ms` : undefined,
        animationFillMode: 'both'
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
