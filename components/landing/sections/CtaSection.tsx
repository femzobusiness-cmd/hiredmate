'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#7C5CBF] to-[#4C3A8F] px-4 py-24 text-center text-white">
      <motion.div
        className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-white opacity-[0.05]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-white opacity-[0.05]"
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-3xl"
      >
        <h2
          className="text-3xl font-black sm:text-4xl md:text-5xl"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Your dream nursing job is one interview away.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
          Start practicing for free. No credit card. Cancel anytime.
        </p>
        <Link
          href="/signup"
          className="mt-10 inline-flex rounded-pill bg-white px-10 py-4 text-lg font-bold text-[#7C5CBF] shadow-xl transition hover:bg-white/95"
        >
          Start Free Now →
        </Link>
        <p className="mt-8 text-sm text-white/75">
          ✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Built for
          nurses
        </p>
      </motion.div>
    </section>
  );
}
