'use client';

import { CountUpStat } from '@/components/landing/CountUpStat';

const STATS = [
  { value: '10,000+', label: 'Nurses Practicing' },
  { value: '5', label: 'Hospital Prep Packs' },
  { value: '3', label: 'Interview Modes' },
  { value: '15', label: 'Nurse Ranks to Earn' },
];

export function StatsSection() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-12 px-4 sm:gap-16">
        {STATS.map((stat) => (
          <CountUpStat key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  );
}
