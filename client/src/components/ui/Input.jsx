import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Input({
  label,
  error,
  helperText,
  type = 'text',
  icon: Icon,
  className = '',
  textarea = false,
  rows = 4,
  required = false,
  id,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const inputClass = cn(
    'w-full rounded-card border bg-white px-3.5 py-2.5 text-sm text-textPrimary placeholder:text-textDisabled transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-signature/20 focus:border-signature',
    error
      ? 'border-semanticError focus:ring-semanticError/20 focus:border-semanticError bg-red-50/10'
      : 'border-borderStandard hover:border-borderStrong shadow-subtle',
    Icon && 'pl-10',
    isPassword && 'pr-10',
    className
  );

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-bold text-carbon uppercase tracking-wider">
            {label} {required && <span className="text-signature font-bold">*</span>}
          </label>
        </div>
      )}

      <div className="relative">
        {Icon && (
          <div className={cn(
            'absolute left-0 pl-3.5 flex pointer-events-none text-textMuted',
            textarea ? 'top-3.5' : 'inset-y-0 items-center'
          )}>
            <Icon className="w-4 h-4" />
          </div>
        )}

        {textarea ? (
          <textarea
            id={inputId}
            rows={rows}
            className={cn(inputClass, 'resize-y')}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            type={effectiveType}
            className={cn(inputClass, 'h-11')}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textMuted hover:text-carbon transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-semanticError font-medium flex items-center gap-1 pt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-textMuted leading-relaxed">{helperText}</p>
      ) : null}
    </div>
  );
}
