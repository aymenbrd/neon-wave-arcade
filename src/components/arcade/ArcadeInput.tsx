import React from 'react';
import { cn } from '@/lib/utils';

interface ArcadeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const ArcadeInput: React.FC<ArcadeInputProps> = ({
  label,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-arcade text-neon-cyan uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan/60">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'arcade-input',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};
