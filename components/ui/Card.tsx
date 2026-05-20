import { cn } from '@/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'gradient';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'rounded-card border border-border bg-card shadow-card',
      bordered: 'rounded-card border border-border bg-card shadow-card',
      gradient: 'rounded-card border border-transparent bg-purple-gradient text-white shadow-card',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
