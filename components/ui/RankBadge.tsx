'use client';

import { motion } from 'framer-motion';

const rankColors = {
  1: 'from-gray-400 to-gray-500',
  2: 'from-gray-400 to-gray-500',
  3: 'from-gray-400 to-gray-500',
  4: 'from-purple-500 to-purple-600',
  5: 'from-purple-500 to-purple-600',
  6: 'from-purple-500 to-purple-600',
  7: 'from-teal-400 to-teal-600',
  8: 'from-teal-400 to-teal-600',
  9: 'from-teal-400 to-teal-600',
  10: 'from-yellow-400 to-orange-500',
  11: 'from-yellow-400 to-orange-500',
  12: 'from-yellow-400 to-orange-500',
  13: 'from-red-400 to-pink-600',
  14: 'from-red-400 to-pink-600',
  15: 'from-red-400 to-pink-600',
};

export function RankBadge({
  rank,
  title,
  animated = false,
}: {
  rank: number;
  title: string;
  animated?: boolean;
}) {
  const colorClass =
    rankColors[rank as keyof typeof rankColors] || 'from-gray-400 to-gray-500';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${colorClass} px-3 py-1 text-xs font-bold text-white shadow-md`}
    >
      {animated && (
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        >
          🩺
        </motion.span>
      )}
      {title}
    </motion.div>
  );
}
