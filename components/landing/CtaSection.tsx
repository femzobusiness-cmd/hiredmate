'use client';

import { fredoka } from '@/components/landing/brand';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo } from 'react';

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        top: `${(i * 23 + 11) % 100}%`,
        size: 2 + (i % 3),
        delay: (i % 8) * 0.5,
        duration: 6 + (i % 5),
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="landing-float absolute rounded-full bg-white/30"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(124, 92, 191, 0.25) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        <h2
          className="text-4xl font-black text-white sm:text-5xl"
          style={fredoka}
        >
          Your dream job is one interview away.
        </h2>
        <p className="mt-4 text-white/60">
          Start practicing for free. No credit card. Cancel anytime.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-10 inline-block"
        >
          <Link
            href="/signup"
            className="inline-flex rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#00C6B2] px-12 py-5 text-lg font-bold text-white shadow-2xl shadow-purple-500/30 transition"
          >
            Start Free Now →
          </Link>
        </motion.div>

        <p className="mt-6 text-sm text-white/40">
          ✓ Free · ✓ No card · ✓ Built for nurses
        </p>
      </motion.div>
    </section>
  );
}
