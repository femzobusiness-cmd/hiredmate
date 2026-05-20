import { cn } from '@/utils/cn';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'teal';
}

export default function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'border border-primary/20 bg-primary/10 text-primary',
    success: 'bg-green-100 text-success',
    warning: 'bg-amber-100 text-warning',
    danger: 'bg-red-100 text-error',
    outline: 'bg-primary-light text-primary',
    teal: 'bg-teal-50 text-secondary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
