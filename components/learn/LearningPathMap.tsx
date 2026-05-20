'use client';

import { WorldCard } from '@/components/learn/WorldCard';
import { PageTransition } from '@/components/ui/PageTransition';
import type { WorldWithProgress } from '@/lib/learning-path';
import { TOTAL_STAGES } from '@/lib/learning-path';
import { motion } from 'framer-motion';

type LearningPathMapProps = {
  worlds: WorldWithProgress[];
  completedCount: number;
};

export function LearningPathMap({ worlds, completedCount }: LearningPathMapProps) {
  const progressPercent = Math.round((completedCount / TOTAL_STAGES) * 100);

  return (
    <PageTransition>
      <motion.div className="mx-auto max-w-2xl space-y-10 pb-16">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 text-center sm:text-left"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Learning Path
          </p>
          <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
            Your Journey to Interview Mastery 🗺️
          </h1>
          <p className="text-text-secondary">
            Complete worlds to unlock new challenges and prove your skills
          </p>
          <div className="rounded-[16px] bg-white p-4 shadow-card">
            <div className="mb-2 flex justify-between text-sm font-semibold">
              <span className="text-text-primary">
                {completedCount} / {TOTAL_STAGES} stages completed
              </span>
              <span className="text-primary">{progressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-purple-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'tween', duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-purple-gradient"
              />
            </div>
          </div>
        </motion.header>

        <div className="relative space-y-16">
          <svg
            className="pointer-events-none absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 overflow-visible"
            aria-hidden
          >
            <motion.path
              d={buildPathD(worlds.length)}
              fill="none"
              stroke="#C4B5FD"
              strokeWidth="3"
              strokeDasharray="8 8"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </svg>

          {worlds.map((world, index) => (
            <div
              key={world.key}
              className={index % 2 === 0 ? 'pr-0 sm:pr-16' : 'pl-0 sm:pl-16'}
            >
              <WorldCard
                world={world}
                index={index}
                align={index % 2 === 0 ? 'left' : 'right'}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </PageTransition>
  );
}

function buildPathD(count: number) {
  const step = 120;
  let d = 'M 16 0';
  for (let i = 0; i < count - 1; i++) {
    const y = step * (i + 1);
    const x = i % 2 === 0 ? 32 : 0;
    d += ` L ${x} ${y}`;
  }
  return d;
}
