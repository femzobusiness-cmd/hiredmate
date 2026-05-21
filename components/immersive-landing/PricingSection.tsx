'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const FREE = [
  'AI Mock Interview (3/day)',
  'Voice Practice (5/day)',
  '2 Hospital Prep Packs',
  'Stage-Based Learning',
  'Community Leaderboard',
];

const PRO = [
  'Everything in Free',
  'Unlimited Mock Interviews',
  'Unlimited Voice Practice',
  'All 5 Hospital Packs',
  'Battle Mode Tournaments',
  'Full Resume Builder + PDF',
  'Priority AI Processing',
];

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/20 px-4 py-2 text-xs font-bold text-[#F59E0B]">
            PRICING
          </span>
          <h2
            className="mt-4 text-4xl font-black text-white sm:text-5xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Start free. Upgrade when ready.
          </h2>
        </motion.div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                !yearly ? 'bg-[#7C5CBF] text-white' : 'text-white/60'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                yearly ? 'bg-[#7C5CBF] text-white' : 'text-white/60'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="immersive-glass rounded-3xl p-8"
          >
            <h3
              className="text-2xl text-white"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Free
            </h3>
            <p className="mt-2 text-5xl font-black text-white">
              $0<span className="text-lg font-normal text-white/40">/month</span>
            </p>
            <div className="my-6 h-px bg-[#00C6B2]/40" />
            <ul className="space-y-3 text-sm text-white/70">
              {FREE.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-[#00C6B2]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 flex w-full justify-center rounded-full border border-white/20 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            >
              Start Free →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative scale-[1.02] rounded-3xl border border-purple-400/30 p-8 md:scale-105"
            style={{
              background:
                'linear-gradient(135deg, rgba(109,40,217,0.3), rgba(76,58,143,0.4))',
              boxShadow:
                '0 0 60px rgba(124,92,191,0.3), 0 0 120px rgba(124,92,191,0.1)',
            }}
          >
            <span className="absolute right-4 top-4 rounded-full bg-[#F59E0B]/20 px-2.5 py-0.5 text-xs font-bold text-[#F59E0B]">
              Best Value
            </span>
            <h3
              className="text-2xl text-white"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Pro
            </h3>
            <motion.p
              key={yearly ? 'y' : 'm'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-5xl font-black text-white"
            >
              {yearly ? '$7.99' : '$12'}
              <span className="text-lg font-normal text-white/40">/mo</span>
            </motion.p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              {PRO.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-purple-300">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 flex w-full justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-400 py-4 font-bold text-white shadow-lg transition hover:shadow-purple-500/40"
            >
              Get Pro →
            </Link>
          </motion.div>
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/70 backdrop-blur-sm">
            🎉 All features are completely free during our beta period
          </span>
        </p>
      </div>
    </section>
  );
}
