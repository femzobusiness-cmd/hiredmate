'use client';

import { fredoka } from '@/components/landing/brand';
import { motion } from 'framer-motion';
import Link from 'next/link';

const HOSPITALS = [
  {
    emoji: '🏥',
    name: 'Mayo Clinic',
    location: 'Rochester, MN',
    insight: 'Patient-first culture — expect STAR stories on advocacy.',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    emoji: '💙',
    name: 'Cleveland Clinic',
    location: 'Cleveland, OH',
    insight: 'Team-based care focus — prepare interdisciplinary examples.',
    gradient: 'from-blue-800 to-indigo-900',
  },
  {
    emoji: '🟣',
    name: 'Northwestern Medicine',
    location: 'Chicago, IL',
    insight: 'Academic rigor — know your evidence-based practice talking points.',
    gradient: 'from-purple-500 to-purple-800',
  },
  {
    emoji: '❤️',
    name: 'HCA Healthcare',
    location: 'Nashville, TN',
    insight: 'High-volume systems — emphasize efficiency and safety metrics.',
    gradient: 'from-red-500 to-red-800',
  },
  {
    emoji: '💚',
    name: 'Kaiser Permanente',
    location: 'Oakland, CA',
    insight: 'Integrated care model — highlight prevention and continuity.',
    gradient: 'from-teal-500 to-[#00C6B2]',
  },
];

export function HospitalsSection() {
  return (
    <section id="hospitals" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#00C6B2]">
            Hospital Prep Packs
          </p>
          <h2 className="mt-3 text-4xl font-black text-white" style={fredoka}>
            Practice for your exact hospital
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/50">
            Culture briefs, real question patterns, and insider tips for top
            employers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="scrollbar-hide mt-12 flex gap-4 overflow-x-auto pb-4"
        >
          {HOSPITALS.map((hospital) => (
            <article
              key={hospital.name}
              className="min-w-[280px] flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition hover:bg-white/10"
            >
              <div
                className={`mb-4 h-1 rounded-full bg-gradient-to-r ${hospital.gradient}`}
              />
              <span className="text-3xl">{hospital.emoji}</span>
              <h3 className="mt-3 font-bold text-white">{hospital.name}</h3>
              <p className="text-xs text-white/40">{hospital.location}</p>
              <p className="mt-3 text-sm italic leading-relaxed text-white/60">
                {hospital.insight}
              </p>
              <Link
                href="/signup"
                className="mt-4 inline-block rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                View Pack →
              </Link>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
