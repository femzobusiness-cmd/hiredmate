'use client';

import { fredoka } from '@/components/landing/brand';
import { MockInterviewMockup } from '@/components/landing/MockInterviewMockup';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
        <div className="w-full max-w-2xl flex-1">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-sm text-white/80">
              🩺 Now live — free for all nurses
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-6 text-5xl font-black leading-tight text-white sm:text-6xl md:text-7xl"
            style={fredoka}
          >
            Land Your
            <br />
            <span
              className="bg-gradient-to-br from-[#A78BFA] to-[#00C6B2] bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #A78BFA, #00C6B2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Dream Nursing
            </span>
            <br />
            Job.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 max-w-lg text-lg leading-relaxed text-white/60"
          >
            Practice with an AI hiring manager that actually pushes back on weak
            answers. Master hospital-specific interviews. Get hired.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="inline-flex rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#6D28D9] px-8 py-4 text-base font-bold text-white shadow-2xl shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
              >
                Start Free — No Card Needed →
              </Link>
            </motion.div>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/50 sm:gap-6"
          >
            <span>✓ Free forever</span>
            <span>✓ No credit card</span>
            <span>✓ Built for nurses</span>
          </motion.div>
        </div>

        <div className="w-full flex-1 lg:flex lg:justify-end">
          <MockInterviewMockup />
        </div>
      </div>
    </section>
  );
}
