'use client';

import { motion } from 'framer-motion';

export function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-md"
    >
      <motion.span
        animate={{
          scale: [1, 1.2, 1],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        🔥
      </motion.span>
      {streak} day streak
    </motion.div>
  );
}
