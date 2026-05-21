'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const HOSPITALS = [
  {
    emoji: '🏥',
    name: 'Mayo Clinic',
    location: 'Rochester, MN',
    type: 'Academic',
    insight: 'Patient-first culture — expect STAR stories on advocacy.',
    glow: '0 0 30px rgba(0,61,165,0.4)',
    questions: ['Why Mayo?', 'Describe patient advocacy.'],
  },
  {
    emoji: '💙',
    name: 'Cleveland Clinic',
    location: 'Cleveland, OH',
    type: 'Academic',
    insight: 'Team-based care — prepare interdisciplinary examples.',
    glow: '0 0 30px rgba(10,76,139,0.4)',
    questions: ['Team conflict resolution?', 'Quality improvement story?'],
  },
  {
    emoji: '🟣',
    name: 'Northwestern Medicine',
    location: 'Chicago, IL',
    type: 'Academic',
    insight: 'Evidence-based practice talking points matter here.',
    glow: '0 0 30px rgba(78,42,132,0.4)',
    questions: ['Why Northwestern?', 'Clinical judgment example?'],
  },
  {
    emoji: '❤️',
    name: 'HCA Healthcare',
    location: 'Nashville, TN',
    type: 'For-Profit',
    insight: 'High-volume — emphasize efficiency and safety metrics.',
    glow: '0 0 30px rgba(198,40,40,0.4)',
    questions: ['Managing high acuity?', 'Safety initiative?'],
  },
  {
    emoji: '💚',
    name: 'Kaiser Permanente',
    location: 'Oakland, CA',
    type: 'Integrated',
    insight: 'Prevention and continuity of care are core values.',
    glow: '0 0 30px rgba(0,91,142,0.4)',
    questions: ['Population health?', 'Care coordination?'],
  },
];

function HospitalCard({
  hospital,
}: {
  hospital: (typeof HOSPITALS)[0];
}) {
  const [hover, setHover] = useState(false);

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="min-w-[300px] flex-shrink-0 rounded-2xl border border-white/8 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10"
      style={{ boxShadow: hover ? hospital.glow : undefined }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{hospital.emoji}</span>
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background:
              hospital.name === 'Mayo Clinic'
                ? '#003DA5'
                : hospital.name.includes('Cleveland')
                  ? '#0A4C8B'
                  : hospital.name.includes('Northwestern')
                    ? '#4E2A84'
                    : hospital.name.includes('HCA')
                      ? '#C62828'
                      : '#005B8E',
          }}
        />
      </div>
      <h3 className="mt-3 text-lg font-bold text-white">{hospital.name}</h3>
      <p className="text-xs text-white/40">{hospital.location}</p>
      <span className="mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">
        {hospital.type}
      </span>
      <p className="mt-3 text-sm italic text-white/55">{hospital.insight}</p>
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-1 border-t border-white/8 pt-3 text-xs text-white/50">
              {hospital.questions.map((q) => (
                <li key={q}>• {q}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <Link
        href="/signup"
        className="mt-4 inline-block rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        View Pack →
      </Link>
    </article>
  );
}

export function HospitalShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let id: number;
    const step = () => {
      if (!paused.current && el) {
        el.scrollLeft += 0.5;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);

  const doubled = [...HOSPITALS, ...HOSPITALS];

  return (
    <section id="hospitals" className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block rounded-full border border-teal-500/30 bg-teal-500/20 px-4 py-2 text-xs font-bold text-[#00C6B2]"
        >
          HOSPITAL PREP PACKS
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 text-4xl font-black text-white sm:text-5xl"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Practice for your exact hospital
        </motion.h2>
        <p className="mx-auto mt-3 max-w-lg text-white/50">
          Culture briefs, real questions, and insider tips.
        </p>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => {
          paused.current = true;
        }}
        onMouseLeave={() => {
          paused.current = false;
        }}
        className="scrollbar-hide mt-12 flex gap-5 overflow-x-auto px-8"
      >
        {doubled.map((h, i) => (
          <HospitalCard key={`${h.name}-${i}`} hospital={h} />
        ))}
      </div>
    </section>
  );
}
