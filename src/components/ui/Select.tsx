import React, { forwardRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, fullWidth = false, className = '', ...props }, ref) => {
    const baseSelectClasses = 'px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';
    const errorSelectClasses = error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600';
    const widthClass = fullWidth ? 'w-full' : '';
    const selectClasses = `${baseSelectClasses} ${errorSelectClasses} ${widthClass} ${className}`;
    
    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <select ref={ref} className={selectClasses} {...props}>
          <option value="" disabled>Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-red-500 dark:text-red-400 text-xs">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;