import { Stethoscope } from 'lucide-react';
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
    sm: { icon: 'h-6 w-6', text: 'text-lg' },
    md: { icon: 'h-8 w-8', text: 'text-xl' },
    lg: { icon: 'h-10 w-10', text: 'text-2xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-white/20 p-2',
          !light && 'bg-light-bg'
        )}
      >
        <Stethoscope
          className={cn(
            sizes[size].icon,
            light ? 'text-white' : 'text-primary'
          )}
        />
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight',
            sizes[size].text,
            light ? 'text-white' : 'text-dark-text'
          )}
        >
          Hired<span className="text-primary">Mate</span>
        </span>
      )}
    </div>
  );
}
