import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({
  label = 'Loading analysis...',
  size = 'md',
  className = ''
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-3 text-center ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-signature`} />
      {label && <p className="text-xs font-medium text-textMuted">{label}</p>}
    </div>
  );
}
