'use client';

import { fredoka } from '@/components/landing/brand';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const FREE_FEATURES = [
  'AI Mock Interview (3/day)',
  'Voice Practice (5/day)',
  '2 Hospital Prep Packs',
  'Stage-Based Learning',
  'Community Leaderboard',
];

const PRO_FEATURES = [
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
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
            Pricing
          </p>
          <h2 className="mt-3 text-4xl font-black text-white" style={fredoka}>
            Start free. Upgrade when ready.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                !yearly
                  ? 'bg-[#7C5CBF] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                yearly
                  ? 'bg-[#7C5CBF] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Yearly
            </button>
          </div>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <h3 className="text-2xl font-black text-white">Free</h3>
            <p className="mt-2 text-4xl font-black text-white">$0 / month</p>
            <ul className="mt-6 space-y-3 text-sm text-white/60">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-[#00C6B2]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 flex w-full items-center justify-center rounded-full border border-white/20 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Start Free →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-600/30 to-purple-900/50 p-8 shadow-xl shadow-purple-500/20 backdrop-blur-xl"
          >
            <span className="absolute right-4 top-4 rounded-full bg-[#F59E0B]/20 px-2.5 py-0.5 text-xs font-bold text-[#F59E0B]">
              Best Value
            </span>
            <h3 className="text-2xl font-black text-white">Pro</h3>
            <p className="mt-2 text-4xl font-black text-white">
              {yearly ? '$7.99' : '$12'}
              <span className="text-lg font-medium text-white/60">
                /{yearly ? 'mo billed yearly' : 'mo'}
              </span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-[#00C6B2]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 flex w-full items-center justify-center rounded-full bg-white py-3 text-sm font-bold text-[#7C5CBF] transition hover:bg-white/90"
            >
              Start Pro →
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-8 max-w-xl text-center"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/70 backdrop-blur-sm">
            🎉 All features free during beta — no credit card needed
          </span>
        </motion.p>
      </div>
    </section>
  );
}
