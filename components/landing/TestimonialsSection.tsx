'use client';

import { fredoka } from '@/components/landing/brand';
import { motion } from 'framer-motion';

// Replace with real testimonials when available.
const TESTIMONIALS = [
  {
    quote:
      "The Mock Interview in Tough mode is brutal. It pushed back on every weak answer and wouldn't move on until I gave a real example. I felt completely prepared for my ICU interview at Mayo.",
    name: 'Jessica T.',
    role: 'ICU RN',
    initials: 'JT',
    color: 'bg-purple-500',
  },
  {
    quote:
      'The Mayo Clinic prep pack had interview questions I actually got asked in my real interview. The culture brief alone changed how I presented myself.',
    name: 'Marcus D.',
    role: 'New Grad RN',
    initials: 'MD',
    color: 'bg-teal-500',
  },
  {
    quote:
      "I said 'um' 14 times in my first voice recording. By my third attempt it was down to 2. The filler word tracker is brutally honest.",
    name: 'Priya K.',
    role: 'Travel Nurse',
    initials: 'PK',
    color: 'bg-[#F59E0B]',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-[#F59E0B]" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl font-black text-white" style={fredoka}>
            Loved by nurses
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/50">
            Real practice. Real confidence. Real interview wins.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <Stars />
              <p className="mt-4 text-sm italic leading-relaxed text-white/80">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
