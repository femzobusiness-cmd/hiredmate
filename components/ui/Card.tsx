import { cn } from '@/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'gradient';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white shadow-card rounded-card',
      bordered: 'bg-white border-2 border-primary/30 rounded-card shadow-card',
      gradient: 'bg-purple-gradient text-white rounded-card shadow-card',
    };

    return (
      <div
        ref={ref}
        className={cn('p-6', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
