'use client';

import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote:
      "The Mock Interview in Tough mode is no joke. It pushed back on every answer and didn't let me get away with vague responses. I felt so prepared walking into my ICU interview.",
    name: 'Jessica T.',
    role: 'ICU RN, Mayo Clinic',
  },
  {
    quote:
      'The Mayo Clinic prep pack had interview questions I actually got asked in my real interview. The culture brief alone was worth it.',
    name: 'Marcus D.',
    role: 'New Grad RN',
  },
  {
    quote:
      "I said 'um' 14 times in my first voice practice recording. By my third attempt it was down to 2. The filler word tracker is brutally honest and I love it.",
    name: 'Priya K.',
    role: 'Travel Nurse',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2
            className="text-3xl font-black text-gray-900 sm:text-4xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Loved by nurses
          </h2>
          <p className="mt-3 text-gray-600">
            Real stories from nurses who got hired
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Illustrative testimonials — replace with real ones when available.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              <p className="text-[#F59E0B]">★★★★★</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 border-t border-gray-100 pt-4">
                <p className="font-bold text-gray-900">— {t.name}</p>
                <p className="text-sm text-[#7C5CBF]">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
