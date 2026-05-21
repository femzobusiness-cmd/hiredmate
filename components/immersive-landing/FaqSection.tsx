'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    q: 'Is HiredMate free?',
    a: 'Yes — all features are free during our beta. No credit card required.',
  },
  {
    q: 'Is this only for new grads?',
    a: 'No. HiredMate works for new grads, experienced RNs, travel nurses, and every specialty.',
  },
  {
    q: 'How is this different from Googling interview questions?',
    a: 'You actually answer questions and get pushed back on weak responses — not just read a list.',
  },
  {
    q: 'Does the AI really push back?',
    a: 'Yes, especially in Tough mode. It asks follow-ups until you give a real STAR example.',
  },
  {
    q: 'What hospitals are covered?',
    a: 'Mayo, Cleveland, Northwestern, HCA, and Kaiser — with more packs coming soon.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. HiredMate is fully responsive and works great on phones and tablets.',
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-medium text-white">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          <ChevronDown className="h-5 w-5 text-white/50" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-sm leading-relaxed text-white/55">{a}</p>
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
          className="text-center text-4xl font-black text-white"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Frequently asked questions
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-12"
        >
          {FAQS.map((f) => (
            <Item key={f.q} q={f.q} a={f.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
