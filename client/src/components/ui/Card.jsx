import React from 'react';

export function Card({
  children,
  className = '',
  interactive = false,
  padded = true,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-standard border border-borderStandard shadow-sm ${
        interactive ? 'hover:border-borderStrong hover:shadow-md transition-all duration-150 cursor-pointer' : ''
      } ${padded ? 'p-5 md:p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
