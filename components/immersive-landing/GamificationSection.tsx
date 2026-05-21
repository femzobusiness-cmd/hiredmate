'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const PILLS = [
  '🔥 Daily Streaks — Keep your momentum',
  '⚡ XP System — Earn points for every answer',
  '🏆 15 Nurse Ranks — From Student to CNO',
  '🌍 5 Worlds — 26 stages of mastery',
];

const BADGES = [
  { icon: '🎯', name: 'First Perfect Score' },
  { icon: '🔥', name: '7-Day Streak' },
  { icon: '⚡', name: 'Battle Survivor' },
];

export function GamificationSection() {
  const ringRef = useRef<SVGSVGElement>(null);
  const inView = useInView(ringRef, { once: true, margin: '-80px' });
  const [fill, setFill] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const target = 73;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1400, 1);
      setFill(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView]);

  const r = 70;
  const c = 2 * Math.PI * r;

  return (
    <section id="how-it-works" className="relative py-28">
      <div className="immersive-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/20 px-4 py-2 text-xs font-bold text-[#F59E0B]">
            GAMIFICATION
          </span>
          <h2
            className="mt-4 text-4xl font-black text-white sm:text-5xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Interview prep that feels like a game
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            {PILLS.map((pill, i) => (
              <motion.div
                key={pill}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 text-white/80"
              >
                {pill}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <svg ref={ringRef} width="200" height="200" className="-rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="url(#rankGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - fill / 100)}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
                <defs>
                  <linearGradient id="rankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C5CBF" />
                    <stop offset="100%" stopColor="#00C6B2" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl">👩‍⚕️</span>
                <p className="mt-1 font-bold text-white">Charge Nurse</p>
              </div>
            </div>
            <div className="mt-6 w-full max-w-xs">
              <div className="mb-1 flex justify-between text-xs text-white/50">
                <span>294 / 500 XP</span>
                <span>{fill}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#00C6B2]"
                  initial={{ width: 0 }}
                  whileInView={{ width: '58.8%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {BADGES.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-6 text-center"
            >
              <div
                className="hex-badge mx-auto flex h-20 w-20 items-center justify-center bg-gradient-to-br from-[#F59E0B] to-[#7C5CBF] text-2xl"
              >
                {b.icon}
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{b.name}</p>
              <div className="shimmer-badge absolute inset-0 opacity-30" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
