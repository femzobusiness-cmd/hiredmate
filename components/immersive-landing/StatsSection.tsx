'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function CountUp({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('0');
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started.current) return;
        started.current = true;
        const match = value.match(/^([^0-9]*)([\d,.]+)(.*)$/);
        if (!match) {
          setDisplay(value);
          return;
        }
        const target = parseFloat(match[2].replace(/,/g, ''));
        const prefix = match[1];
        const suffix = match[3];
        const start = performance.now();
        const dur = 1500;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const n = Math.round(target * eased);
          const formatted =
            target >= 1000 ? n.toLocaleString() : String(n);
          setDisplay(`${prefix}${formatted}${suffix}`);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-black text-white sm:text-4xl">{display}</p>
      <p className="mt-1 text-sm text-white/40">{label}</p>
    </div>
  );
}

const STATS = [
  { value: '10,000+', label: 'Nurses Practicing' },
  { value: '5', label: 'Hospital Packs' },
  { value: '3', label: 'Interview Modes' },
  { value: '15', label: 'Nurse Ranks' },
];

export function StatsSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="stats-breathe border-y border-white/8 bg-white/[0.03] py-16 backdrop-blur-sm"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 px-4 md:flex md:flex-row md:items-center md:justify-center md:gap-0">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex items-center justify-center md:flex-1">
            <CountUp value={s.value} label={s.label} />
            {i < STATS.length - 1 && (
              <div
                className="mx-8 hidden h-16 w-px bg-white/10 md:block lg:mx-16"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
