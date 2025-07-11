import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const baseInputClasses = 'px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';
    const errorInputClasses = error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600';
    const widthClass = fullWidth ? 'w-full' : '';
    const inputClasses = `${baseInputClasses} ${errorInputClasses} ${widthClass} ${className}`;
    
    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && (
          <p className="mt-1 text-red-500 dark:text-red-400 text-xs">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;