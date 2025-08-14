import React from 'react';
import { useConfig } from '../../contexts/ConfigContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const { themeColor } = useConfig();
  
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: `text-white shadow-sm hover:shadow-md`,
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-600 dark:hover:bg-purple-700 shadow-sm hover:shadow-md',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
  };
  
  const fullWidthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';
  
  // Dynamic styles for primary button
  const dynamicStyles = variant === 'primary' ? {
    backgroundColor: themeColor,
    '--tw-ring-color': themeColor,
  } : variant === 'outline' ? {
    '--tw-ring-color': themeColor,
  } : {};
  
  // Dynamic hover styles
  const hoverStyles = variant === 'primary' ? {
    '--hover-bg': `color-mix(in srgb, ${themeColor} 80%, black 20%)`,
  } : {};
  
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidthClass,
    disabledClass,
    className,
  ].join(' ');
  
  return (
    <button
      className={buttonClasses}
      style={{ ...dynamicStyles, ...hoverStyles }}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${themeColor} 80%, black 20%)`;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = themeColor;
        }
      }}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
          <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;