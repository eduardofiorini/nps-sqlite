import React, { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    secondary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    info: 'bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200',
  };
  
  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return <span className={badgeClasses}>{children}</span>;
};

export default Badge;