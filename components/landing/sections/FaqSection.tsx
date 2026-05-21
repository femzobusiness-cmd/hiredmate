'use client';

import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    q: 'Is HiredMate free?',
    a: "Yes — all features are currently free during our beta. No credit card required. We'll introduce a Pro plan in the future with advanced features.",
  },
  {
    q: 'Is this only for new grad nurses?',
    a: 'No — HiredMate is built for nurses at every stage. New grads use it to land their first job, experienced nurses use it to move into specialty units or leadership roles, and travel nurses use it to prep for agency interviews.',
  },
  {
    q: 'How is this different from just Googling interview questions?',
    a: 'Google gives you a list of questions to read. HiredMate makes you actually answer them — out loud, under time pressure, with an AI that pushes back when your answer is weak. The difference is practicing vs reading about practicing.',
  },
  {
    q: 'Does the AI really push back on weak answers?',
    a: 'Yes. In Tough mode especially, the interviewer will follow up with "That\'s not specific enough. Give me a real example." or "I\'ve heard that before. What actually happened?" It only moves on when your answer demonstrates genuine competence.',
  },
  {
    q: 'What hospitals are covered?',
    a: 'Mayo Clinic, Cleveland Clinic, Northwestern Medicine, HCA Healthcare, and Kaiser Permanente. More coming soon.',
  },
  {
    q: 'Can I use this on my phone?',
    a: 'Yes — HiredMate is fully mobile-responsive. The Voice Practice feature works on mobile too (microphone access required).',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-black text-gray-900 sm:text-4xl"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => {
            const open = openIndex === i;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-[20px] border border-gray-100 bg-[#F8F7FF] shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-[#7C5CBF] transition-transform',
                      open && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="border-t border-gray-100 px-5 pb-4 pt-2 text-sm leading-relaxed text-gray-600">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
