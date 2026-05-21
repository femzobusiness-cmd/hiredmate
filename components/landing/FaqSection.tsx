'use client';

import { fredoka } from '@/components/landing/brand';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    q: 'Is HiredMate free?',
    a: 'Yes — all features are free during our beta. No credit card required to start.',
  },
  {
    q: 'Is this only for new grads?',
    a: 'No. HiredMate works for new grads, experienced RNs, travel nurses, and specialty nurses at every career stage.',
  },
  {
    q: 'How is this different from Googling interview questions?',
    a: 'You actually answer questions out loud and get pushed back on weak responses — not just read a list of prompts.',
  },
  {
    q: 'Does the AI really push back?',
    a: 'Yes, especially in Tough mode. The AI hiring manager won’t accept vague answers and asks follow-ups until you give a real example.',
  },
  {
    q: 'What hospitals are covered?',
    a: 'Mayo Clinic, Cleveland Clinic, Northwestern Medicine, HCA Healthcare, and Kaiser Permanente — with more packs coming soon.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. HiredMate is fully responsive and works on phones and tablets.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-medium text-white">{q}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-white/60 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-sm leading-relaxed text-white/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl font-black text-white"
          style={fredoka}
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12"
        >
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
