'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  maxOffset?: number;
  radius?: number;
  onClick?: () => void;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function MagneticButton({
  children,
  href,
  className,
  maxOffset = 8,
  radius = 150,
  onClick,
  pulse = false,
  size = 'sm',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const sizeClasses = {
    sm: 'px-6 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-lg',
  };

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) {
      const pull = Math.min(dist / radius, 1);
      x.set((dx / rect.width) * maxOffset * pull * 2);
      y.set((dy / rect.height) * maxOffset * pull * 2);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const inner = (
    <motion.span
      style={{ x: springX, y: springY }}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#A78BFA] font-semibold text-white shadow-[0_0_20px_rgba(124,92,191,0.5)] transition-shadow hover:shadow-[0_0_40px_rgba(124,92,191,0.8)]',
        sizeClasses[size],
        pulse && 'pulse-ring-cta',
        className
      )}
    >
      {children}
    </motion.span>
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block will-change-transform"
    >
      {href ? (
        <Link href={href} onClick={onClick}>
          {inner}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className="block">
          {inner}
        </button>
      )}
    </motion.div>
  );
}
