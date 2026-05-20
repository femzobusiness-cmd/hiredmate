'use client';

import { getCategoryLabel, getSkillProgress, type SkillDefinition } from '@/lib/skills';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type SkillWithProgress = SkillDefinition & {
  xp: number;
  level: number;
  sessionsCount: number;
  avgScore: number | null;
  lastPracticed: string | null;
};

function useCountUp(end: number, duration = 900) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = window.setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        window.clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, [end, duration]);

  return count;
}

export function SkillCard({
  skill,
  index,
  onSelect,
}: {
  skill: SkillWithProgress;
  index: number;
  onSelect: (skill: SkillWithProgress) => void;
}) {
  const progress = getSkillProgress(skill.xp);
  const animatedXp = useCountUp(progress.xpInLevel);
  const mastered = skill.level >= skill.maxLevel;
  const notStarted = skill.sessionsCount === 0;
  const inProgress = !notStarted && !mastered;
  const barPercent = (progress.xpInLevel / skill.xpPerLevel) * 100;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(124,92,191,0.18)' }}
      onClick={() => onSelect(skill)}
      className={cn(
        'relative flex h-full w-full flex-col rounded-card border border-purple-50 bg-white p-5 text-left shadow-card transition-shadow',
        mastered && 'ring-2 ring-gold/40'
      )}
    >
      {mastered && (
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="pointer-events-none absolute right-4 top-4 text-lg"
        >
          ✨
        </motion.span>
      )}

      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl">{skill.icon}</span>
        <span
          className="rounded-pill px-3 py-1 text-xs font-black text-white"
          style={{ backgroundColor: skill.color }}
        >
          LVL {skill.level}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-black text-text-primary">{skill.name}</h3>
        <span
          className="mt-2 inline-flex rounded-pill px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: skill.lightColor, color: skill.color }}
        >
          {getCategoryLabel(skill.category)}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-text-secondary">
          <span>
            Level {skill.level} / {skill.maxLevel}
          </span>
          <span>{animatedXp} XP</span>
        </div>
        <motion.div className="h-2.5 overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barPercent}%` }}
            transition={{ duration: 1, delay: 0.25 + index * 0.04 }}
            className="h-full rounded-full"
            style={{ backgroundColor: skill.color }}
          />
        </motion.div>
        <p className="mt-2 text-xs font-semibold text-text-muted">
          {progress.xpToNext} XP to next level
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-input p-2">
          <p className="font-black text-text-primary">{skill.sessionsCount}</p>
          <p className="text-text-muted">Sessions</p>
        </div>
        <div className="rounded-xl bg-input p-2">
          <p className="font-black text-text-primary">
            {skill.avgScore != null ? `${Math.round(skill.avgScore)}%` : '--'}
          </p>
          <p className="text-text-muted">Avg Score</p>
        </div>
        <div className="rounded-xl bg-input p-2">
          <p className="font-black text-text-primary">
            {skill.lastPracticed
              ? `${Math.max(
                  0,
                  Math.floor(
                    (Date.now() - new Date(skill.lastPracticed).getTime()) / 86400000
                  )
                )}d`
              : '--'}
          </p>
          <p className="text-text-muted">Last</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        {notStarted && (
          <span className="rounded-pill bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
            Not started
          </span>
        )}
        {inProgress && (
          <span
            className="rounded-pill px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: skill.color }}
          >
            In Progress
          </span>
        )}
        {mastered && (
          <span className="rounded-pill bg-gold/20 px-3 py-1 text-xs font-bold text-amber-700">
            ✨ Mastered
          </span>
        )}

        <span className="text-sm font-bold">
          {notStarted ? (
            <span className="text-primary">Practice Now →</span>
          ) : (
            <span style={{ color: skill.color }}>Continue →</span>
          )}
        </span>
      </div>
    </motion.button>
  );
}
