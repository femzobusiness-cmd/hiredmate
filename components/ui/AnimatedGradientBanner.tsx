'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function AnimatedGradientBanner({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6 text-white shadow-[var(--shadow-lg)]"
      style={{
        background:
          'linear-gradient(135deg, #7C5CBF 0%, #00C6B2 50%, #9B7FD4 100%)',
        backgroundSize: '200% 200%',
      }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}
