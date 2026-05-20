import { Check, Stethoscope } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  light?: boolean;
}

export default function Logo({
  size = 'md',
  showText = true,
  className,
  light = false,
}: LogoProps) {
  const sizes = {
    sm: { icon: 'h-5 w-5', check: 'h-2.5 w-2.5', text: 'text-lg' },
    md: { icon: 'h-7 w-7', check: 'h-3 w-3', text: 'text-xl' },
    lg: { icon: 'h-9 w-9', check: 'h-4 w-4', text: 'text-2xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-input bg-purple-gradient p-2 shadow-button',
          light && 'border-primary/40 bg-primary/15'
        )}
      >
        <Stethoscope
          className={cn(
            sizes[size].icon,
            'text-white'
          )}
        />
        <Check
          className={cn(
            'absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-primary',
            sizes[size].check
          )}
        />
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight',
            sizes[size].text,
            'text-text-primary'
          )}
        >
          Hired<span className="text-primary">Mate</span>
        </span>
      )}
    </div>
  );
}
