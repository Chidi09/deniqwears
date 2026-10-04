import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
  className: string;
}

interface CheckoutFieldProps {
  id: string;
  label: string;
  /** Shown under the field, in red, when present. */
  error?: string;
  hint?: string;
  className?: string;
  children: (control: ControlProps) => React.ReactNode;
}

const BASE = 'w-full bg-[#FAF9F6] border px-3.5 py-3 text-base sm:text-sm focus:outline-none transition-colors';

/**
 * A labelled form field with an inline error. Text is 16px on phones so iOS
 * doesn't zoom the page when a field is focused.
 */
export const CheckoutField: React.FC<CheckoutFieldProps> = ({ id, label, error, hint, className = '', children }) => {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-xs uppercase tracking-wider font-semibold text-[#56554F]">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': !!error,
        'aria-describedby': describedBy,
        className: `${BASE} ${
          error ? 'border-[#B3261E] focus:border-[#B3261E]' : 'border-[#D8D4CC] focus:border-[#171714]'
        }`,
      })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-xs text-[#B3261E]">
          <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-[#8A8780]">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
