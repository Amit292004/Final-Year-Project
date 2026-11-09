import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge multiple class values and resolve Tailwind class conflicts cleanly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
