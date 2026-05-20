'use client';

import { motion } from 'framer-motion';

export function FloatingParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-purple-200 opacity-40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            type: 'tween',
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
