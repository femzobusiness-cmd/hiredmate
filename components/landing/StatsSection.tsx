'use client';

import { CountUpStat } from '@/components/landing/CountUpStat';
import { motion } from 'framer-motion';

const STATS = [
  { value: '10,000+', label: 'Nurses Practicing' },
  { value: '5', label: 'Hospital Packs' },
  { value: '3', label: 'Interview Modes' },
  { value: '15', label: 'Nurse Ranks' },
];

export function StatsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-y border-white/10 bg-white/5 py-12 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-10 px-4 md:flex-nowrap md:gap-0">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center">
            <CountUpStat value={stat.value} label={stat.label} />
            {i < STATS.length - 1 && (
              <div
                className="mx-8 hidden h-12 w-px bg-white/10 md:block lg:mx-16"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
