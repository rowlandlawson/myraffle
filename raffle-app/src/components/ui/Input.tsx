import { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError | string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', fullWidth = true, ...props }, ref) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
          w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white 
          placeholder-slate-500 focus:outline-none focus:ring-2 transition-all
          ${errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-600 focus:border-red-500 focus:ring-red-500/20'}
          ${className}
        `}
          {...props}
        />
        {errorMessage && (
          <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
