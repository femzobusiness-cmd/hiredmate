'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  glass?: boolean;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hover = true,
  glass = false,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
              boxShadow: '0 16px 48px rgba(124,92,191,0.2)',
            }
          : {}
      }
      className={`${
        glass ? 'glass-card' : 'border border-purple-50 bg-white'
      } rounded-2xl p-6 transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
