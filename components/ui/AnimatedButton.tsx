'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
}: AnimatedButtonProps) {
  const variants = {
    primary:
      'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-[0_4px_16px_rgba(124,92,191,0.4)]',
    secondary: 'border-2 border-purple-200 bg-white text-purple-600',
    ghost: 'bg-transparent text-purple-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} rounded-full font-semibold transition-all duration-200 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
