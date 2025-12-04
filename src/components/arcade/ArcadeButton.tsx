import React from 'react';
import { cn } from '@/lib/utils';

interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'magenta' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const ArcadeButton: React.FC<ArcadeButtonProps> = ({
  variant = 'cyan',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const variantClasses = {
    cyan: 'arcade-btn-cyan',
    magenta: 'arcade-btn-magenta',
    purple: 'arcade-btn-purple',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-[0.6rem]',
    md: 'px-6 py-3 text-[0.7rem]',
    lg: 'px-8 py-4 text-[0.8rem]',
  };

  return (
    <button
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
