'use client';

import { MagneticButton } from '@/components/immersive-landing/ui/MagneticButton';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function FinalCta() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 19 + 5) % 100}%`,
        top: `${(i * 23 + 10) % 100}%`,
        duration: 4 + (i % 5),
        delay: (i % 7) * 0.3,
      })),
    []
  );

  return (
    <section className="relative overflow-hidden py-40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(109,40,217,0.4) 0%, rgba(4,0,15,0) 70%)',
        }}
        aria-hidden
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute h-1 w-1 rounded-full bg-white/20"
          style={{
            left: p.left,
            top: p.top,
            animation: `particle-float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        <h2
          className="text-4xl font-black text-white sm:text-6xl"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Your dream job is one interview away.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-xl text-white/50">
          Start practicing for free. No credit card. No limits.
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticButton href="/signup" size="lg" maxOffset={10} pulse>
            Start Free Now →
          </MagneticButton>
        </div>
        <p className="mt-6 text-sm text-white/30">
          ✓ Free · ✓ No card · ✓ Built for nurses
        </p>
      </motion.div>
    </section>
  );
}
