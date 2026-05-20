'use client';

import { motion } from 'framer-motion';

export function XPCounter({ value, max }: { value: number; max: number }) {
  const progress = max > 0 ? Math.min(100, (value / max) * 100) : 100;

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-gray-500">
        <span>{value} XP</span>
        <span>{max} XP</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-purple-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}
