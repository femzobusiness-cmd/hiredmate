'use client';

import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-purple-gradient text-white shadow-button hover:scale-[1.02] hover:brightness-105 disabled:opacity-60',
      secondary:
        'border border-primary bg-white text-primary hover:bg-primary-light',
      outline:
        'border border-primary bg-white text-primary hover:bg-primary-light',
      ghost: 'bg-transparent text-primary hover:bg-primary-light',
      danger: 'bg-gradient-to-r from-red-500 to-error text-white shadow-button hover:scale-[1.02] hover:brightness-105',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
