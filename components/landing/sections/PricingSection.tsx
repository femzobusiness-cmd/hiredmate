'use client';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const FREE_FEATURES = [
  'AI Mock Interview (3 sessions/day)',
  'Voice Practice (5 sessions/day)',
  'Hospital Prep Packs (2 packs)',
  'Stage-Based Learning',
  'Community Leaderboard',
  'Basic Resume Builder',
];

const PRO_FEATURES = [
  'Unlimited Mock Interviews',
  'Unlimited Voice Practice',
  'All 5 Hospital Prep Packs',
  'Battle Mode tournaments',
  'Full Resume Builder + PDF export',
  'Priority AI processing',
  'Achievement sharing cards',
];

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-[#F8F7FF] px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
            Pricing
          </p>
          <h2
            className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Start free. Upgrade when you&apos;re ready.
          </h2>

          <div className="mt-8 inline-flex items-center gap-2 rounded-pill bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                'rounded-pill px-5 py-2 text-sm font-bold transition',
                !yearly ? 'bg-[#7C5CBF] text-white' : 'text-gray-600'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                'flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-bold transition',
                yearly ? 'bg-[#7C5CBF] text-white' : 'text-gray-600'
              )}
            >
              Yearly
              <span className="rounded-pill bg-[#F59E0B] px-2 py-0.5 text-[10px] text-white">
                Save 40%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[20px] bg-white p-8 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
          >
            <h3 className="text-2xl font-bold text-gray-900">Free</h3>
            <p className="mt-2 text-4xl font-black text-[#7C5CBF]">
              $0
              <span className="text-base font-medium text-gray-500">/month</span>
            </p>
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-[#00C6B2]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 flex w-full items-center justify-center rounded-pill border-2 border-[#7C5CBF] py-3 font-bold text-[#7C5CBF] transition hover:bg-[#7C5CBF]/10"
            >
              Start Free →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative scale-100 rounded-[20px] bg-gradient-to-br from-[#7C5CBF] to-[#4C3A8F] p-8 text-white shadow-2xl lg:scale-[1.02]"
          >
            <span className="absolute -top-3 right-6 rounded-pill bg-[#F59E0B] px-3 py-1 text-xs font-bold">
              Best Value
            </span>
            <h3 className="text-2xl font-bold">Pro</h3>
            <p className="mt-2 text-4xl font-black">
              {yearly ? '$7.99' : '$12'}
              <span className="text-base font-medium text-white/80">/month</span>
            </p>
            {yearly && (
              <p className="text-sm text-white/70">billed yearly</p>
            )}
            <p className="mt-4 text-sm font-semibold text-white/90">
              Everything in Free, plus:
            </p>
            <ul className="mt-4 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-white/90">
                  <span>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 flex w-full items-center justify-center rounded-pill bg-white py-3 font-bold text-[#7C5CBF] transition hover:bg-white/95"
            >
              Start Pro →
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 rounded-[20px] border border-[#00C6B2]/30 bg-[#00C6B2]/10 px-6 py-4 text-center text-sm font-bold text-[#00A896]"
        >
          🎉 All features are currently free during our beta period — no credit
          card needed
        </motion.p>
      </div>
    </section>
  );
}
