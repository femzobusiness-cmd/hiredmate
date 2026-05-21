'use client';

import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export function HeroSection() {
  return (
    <section className="bg-[#F8F7FF] px-4 pb-16 pt-24 text-center sm:pt-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.span
            custom={0}
            variants={fadeUp}
            className="rounded-pill border border-[#7C5CBF]/30 bg-[#7C5CBF]/10 px-4 py-1.5 text-xs font-bold text-[#7C5CBF] sm:text-sm"
          >
            🩺 The #1 AI Interview Prep for Nurses
          </motion.span>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mt-6 text-4xl font-black leading-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Land Your{' '}
            <span className="bg-gradient-to-r from-[#7C5CBF] to-[#00C6B2] bg-clip-text text-transparent">
              Dream Nursing Job.
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-lg text-gray-600 sm:text-xl"
          >
            Practice with an AI hiring manager that actually pushes back. Master
            hospital-specific interviews. Get hired faster.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8] px-8 py-4 text-base font-bold text-white shadow-xl transition hover:brightness-105 sm:text-lg"
            >
              Start Free — No Card Required →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-pill border-2 border-[#7C5CBF] px-8 py-4 text-base font-bold text-[#7C5CBF] transition hover:bg-[#7C5CBF]/10 sm:text-lg"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.p
            custom={4}
            variants={fadeUp}
            className="mt-8 text-sm font-medium text-gray-500"
          >
            ✓ Free to use &nbsp;·&nbsp; ✓ Built for nurses &nbsp;·&nbsp; ✓ 5
            hospital prep packs
          </motion.p>
        </motion.div>

        <DashboardMockup />
      </div>
    </section>
  );
}
