'use client';

import { HeroDemoCard } from '@/components/immersive-landing/HeroDemoCard';
import { MagneticButton } from '@/components/immersive-landing/ui/MagneticButton';
import {
  AnimatePresence,
  motion,
  useMotionValue,
} from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const NURSE_TYPES = [
  'For ICU nurses 🏥',
  'For travel nurses ✈️',
  'For new grads 🎓',
  'For ED nurses 🚨',
];

function AchievementToast({
  delay,
  children,
  className,
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [40, 0, 0, -10],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: 4,
        times: [0, 0.15, 0.75, 1],
      }}
      className={`absolute z-10 flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3 backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [typeIdx, setTypeIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTypeIdx((i) => (i + 1) % NURSE_TYPES.length), 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, [mouseX, mouseY]);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      <AchievementToast
        delay={0}
        className="bottom-8 left-4 hidden max-w-xs lg:flex"
      >
        <span className="text-lg">🏆</span>
        <div>
          <p className="text-sm font-medium text-white">Rank Up! Charge Nurse achieved</p>
          <span className="text-xs font-bold text-[#F59E0B]">+150 XP</span>
        </div>
      </AchievementToast>
      <AchievementToast
        delay={2}
        className="bottom-24 right-8 hidden max-w-xs lg:flex"
      >
        <span className="text-lg">🎯</span>
        <p className="text-sm font-medium text-white">
          Perfect Score! Mayo Clinic Pack — <span className="text-[#00C6B2]">98%</span>
        </p>
      </AchievementToast>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="relative max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 shimmer-badge"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs text-white/70">
              ✦ Free for all nurses during beta
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-6 text-[40px] font-black leading-[1.1] text-white sm:text-6xl lg:text-[72px]"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Land Your
            <br />
            <span className="gradient-text-animated">Dream Nursing</span>
            <br />
            Job.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-4 max-w-md text-lg leading-relaxed text-white/55"
          >
            Practice with an AI hiring manager that actually pushes back. Master
            hospital-specific interviews. Get hired faster.
          </motion.p>

          <div className="mt-2 h-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={typeIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-sm text-purple-300/80"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {NURSE_TYPES[typeIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <MagneticButton href="/signup" size="md" maxOffset={10} pulse>
              Start Free — No Card Needed →
            </MagneticButton>
            <a
              href="#features"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-8 py-4 text-base font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
            >
              Watch Demo ▶
            </a>
          </motion.div>

          <div className="mt-6 flex flex-wrap gap-2">
            {['✓ Free forever', '✓ No credit card', '✓ Built for nurses'].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50"
                >
                  {t}
                </span>
              )
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroDemoCard mouseX={mouseX} mouseY={mouseY} />
        </div>
      </div>
    </section>
  );
}
