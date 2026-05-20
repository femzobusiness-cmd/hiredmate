'use client';

import { motion } from 'framer-motion';

export function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="gradient-mesh h-full w-full" />
      <motion.div
        className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-300 opacity-20 blur-3xl"
        animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
        transition={{ type: 'tween', duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-teal-300 opacity-20 blur-3xl"
        animate={{ x: [20, -20, 20], y: [20, -20, 20] }}
        transition={{ type: 'tween', duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
