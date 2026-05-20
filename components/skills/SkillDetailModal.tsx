'use client';

import { getSkillProgress } from '@/lib/skills';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SkillWithProgress } from './SkillCard';

type SkillAnswerHighlight = {
  question: string;
  score: number;
};

export function SkillDetailModal({
  skill,
  strengths,
  onClose,
}: {
  skill: SkillWithProgress | null;
  strengths: SkillAnswerHighlight[];
  onClose: () => void;
}) {
  const progress = skill ? getSkillProgress(skill.xp) : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {skill && progress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            layoutId={`skill-card-${skill.key}`}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(124,92,191,0.25)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-5xl">{skill.icon}</span>
                <h2 className="mt-3 text-3xl font-black text-text-primary">{skill.name}</h2>
                <p className="mt-2 text-text-secondary">{skill.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3 py-1 text-sm font-bold text-text-muted hover:bg-input"
              >
                Close
              </button>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
                Level progression
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: skill.maxLevel }).map((_, index) => {
                  const levelNumber = index + 1;
                  const completed = levelNumber < skill.level;
                  const current = levelNumber === skill.level;

                  return (
                    <motion.div
                      key={levelNumber}
                      animate={current ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 1.4, repeat: current ? Infinity : 0 }}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-black',
                        completed && 'text-white',
                        current && 'ring-4 ring-offset-2',
                        !completed && !current && 'bg-gray-100 text-gray-400'
                      )}
                      style={{
                        backgroundColor: completed || current ? skill.color : undefined,
                        ...(current
                          ? ({ '--tw-ring-color': skill.color } as React.CSSProperties)
                          : {}),
                      }}
                    >
                      {levelNumber}
                    </motion.div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-semibold text-text-secondary">
                {progress.xpInLevel} / {skill.xpPerLevel} XP in current level ·{' '}
                {progress.xpToNext} XP to next
              </p>
            </div>

            <div className="mt-8 rounded-card border border-border bg-input p-4">
              <p className="text-sm font-bold text-text-primary">XP history</p>
              <div className="mt-4 flex h-24 items-end gap-2">
                {Array.from({ length: 6 }).map((_, index) => {
                  const height = Math.max(
                    12,
                    ((skill.xp / (skill.maxLevel * skill.xpPerLevel)) * 100) *
                      (0.4 + index * 0.1)
                  );
                  return (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.08 }}
                      className="flex-1 rounded-t-lg"
                      style={{ backgroundColor: skill.color, opacity: 0.35 + index * 0.1 }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
                Strengths in this skill
              </p>
              {strengths.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {strengths.map((item) => (
                    <li
                      key={item.question}
                      className="rounded-card border border-border bg-white px-4 py-3 text-sm text-text-secondary"
                    >
                      <span className="font-bold text-success">{item.score}%</span> ·{' '}
                      {item.question}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-text-secondary">
                  Complete a focused practice session to unlock personalized strengths.
                </p>
              )}
            </div>

            <Link
              href={`/practice?skill=${skill.key}`}
              className="mt-8 inline-flex w-full items-center justify-center rounded-pill bg-gradient-to-r from-primary to-[#9B7FD4] px-6 py-4 text-center font-bold text-white shadow-button"
            >
              Practice this skill
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}