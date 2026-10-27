import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
  label,
  error,
  helperText,
  type = 'text',
  icon: Icon,
  className = '',
  textarea = false,
  rows = 4,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClass = `w-full rounded-standard border bg-white px-3.5 py-2.5 text-sm text-textPrimary placeholder:text-textDisabled transition duration-150 focus:outline-none focus:ring-2 focus:ring-signature focus:border-signature ${
    error ? 'border-semanticError focus:ring-semanticError' : 'border-borderStandard hover:border-borderStrong'
  } ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {textarea ? (
          <textarea rows={rows} className={inputClass} {...props} />
        ) : (
          <input type={effectiveType} className={`${inputClass} h-11`} {...props} />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-carbon"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-semanticError font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-textMuted">{helperText}</p>
      ) : null}
    </div>
  );
}
