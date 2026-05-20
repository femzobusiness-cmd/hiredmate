'use client';

import type { WorldWithProgress } from '@/lib/learning-path';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type WorldCardProps = {
  world: WorldWithProgress;
  index: number;
  align: 'left' | 'right';
};

export function WorldCard({ world, index, align }: WorldCardProps) {
  const [shake, setShake] = useState(false);
  const isLocked = world.status === 'locked';
  const isComplete = world.status === 'completed';
  const currentStage = world.stages.find((s) => s.status === 'current');
  const ctaLabel = isComplete
    ? 'Replay →'
    : world.completedStages > 0
      ? 'Continue →'
      : 'Start →';

  const handleLockedClick = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 40, x: align === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 260, damping: 24 }}
      className={cn(
        'relative max-w-md overflow-hidden rounded-[24px] p-6 shadow-card transition-shadow',
        `bg-gradient-to-br ${world.gradient}`,
        isLocked && 'cursor-not-allowed opacity-70',
        shake && 'animate-[shake_0.45s_ease-in-out]'
      )}
    >
      {isLocked && (
        <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <Lock className="h-10 w-10 text-white" />
          <span className="mt-2 rounded-pill bg-white/20 px-3 py-1 text-sm font-bold text-white">
            Unlocks at Level {world.required_level}
          </span>
        </motion.div>
      )}

      {isComplete && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-300/30 via-transparent to-amber-400/20" />
      )}

      <div className={cn(isLocked && 'blur-sm')}>
        <div className="flex items-start gap-4">
          <span className="text-6xl leading-none">{world.icon}</span>
          <div className="min-w-0 flex-1">
            {isComplete && (
              <span className="mb-1 inline-block rounded-pill bg-amber-400/90 px-2 py-0.5 text-xs font-bold text-amber-950">
                ✨ World Complete!
              </span>
            )}
            <h3 className="text-xl font-black text-white">{world.title}</h3>
            <p className="mt-1 text-sm text-white/80">{world.description}</p>
            <p className="mt-3 text-sm font-semibold text-white/90">
              {world.completedStages}/{world.total_stages} stages complete
            </p>
            <motion.div className="mt-3 flex flex-wrap gap-1.5">
              {world.stages.map((stage) => (
                <span
                  key={stage.key}
                  title={stage.title}
                  className={cn(
                    'h-3 w-3 rounded-full',
                    stage.status === 'completed' && 'bg-white',
                    stage.status === 'current' && 'animate-pulse ring-2 ring-white ring-offset-1',
                    stage.status === 'locked' && 'bg-white/30',
                    stage.is_boss_stage &&
                      stage.status !== 'locked' &&
                      'ring-2 ring-red-400'
                  )}
                />
              ))}
            </motion.div>
          </div>
          {isComplete && <span className="text-4xl">👑</span>}
        </div>

        {!isLocked && (
          <span
            className={cn(
              'mt-5 inline-flex w-full items-center justify-center rounded-pill py-2.5 text-sm font-bold',
              isComplete
                ? 'border-2 border-white/60 bg-transparent text-white'
                : 'bg-white text-gray-900 shadow-md'
            )}
          >
            {ctaLabel}
          </span>
        )}
      </div>
    </motion.div>
  );

  if (isLocked) {
    return (
      <div
        className={cn('w-full', align === 'left' ? 'mr-auto' : 'ml-auto')}
        onClick={handleLockedClick}
        onKeyDown={(e) => e.key === 'Enter' && handleLockedClick()}
        role="button"
        tabIndex={0}
      >
        {card}
      </div>
    );
  }

  return (
    <Link
      href={`/learn/${world.key}`}
      className={cn('block w-full', align === 'left' ? 'mr-auto' : 'ml-auto')}
    >
      {card}
    </Link>
  );
}
