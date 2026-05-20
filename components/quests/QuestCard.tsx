'use client';

import type { QuestWithProgress } from '@/lib/quests';
import { getProgressLabel, getProgressPercent } from '@/lib/quests';
import { cn } from '@/utils/cn';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

type QuestCardProps = {
  quest: QuestWithProgress;
  index: number;
  variant?: 'daily' | 'weekly';
};

export function QuestCard({ quest, index, variant = 'daily' }: QuestCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const percent = getProgressPercent(quest, quest.progress);
  const label = getProgressLabel(quest, quest.progress);
  const isWeekly = variant === 'weekly';
  const inProgress = quest.progress > 0 && !quest.completed;
  const firedConfetti = useRef(false);

  useEffect(() => {
    if (!quest.completed || firedConfetti.current) return;
    firedConfetti.current = true;
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    confetti({
      particleCount: 60,
      spread: 55,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: isWeekly
        ? ['#F59E0B', '#FBBF24', '#7C5CBF']
        : ['#7C5CBF', '#00C6B2', '#F59E0B'],
    });
  }, [quest.completed, isWeekly]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
      className={cn(
        'relative rounded-[20px] border border-border bg-white p-5 shadow-card transition-all hover:-translate-y-1',
        isWeekly
          ? 'hover:shadow-[0_16px_40px_rgba(245,158,11,0.18)]'
          : 'hover:shadow-[0_16px_40px_rgba(124,92,191,0.2)]',
        quest.completed && 'opacity-90'
      )}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-full',
            isWeekly
              ? 'bg-gradient-to-br from-amber-100 to-amber-50'
              : 'bg-gradient-to-br from-purple-100 to-teal-50'
          )}
        >
          <span className="text-3xl leading-none">{quest.icon}</span>
        </motion.div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-text-primary">{quest.title}</h3>
          <p className="mt-1 text-sm text-text-secondary">{quest.description}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <span
            className={cn(
              'rounded-pill px-3 py-1 text-xs font-bold',
              isWeekly ? 'bg-amber-100 text-amber-800' : 'bg-amber-50 text-amber-700'
            )}
          >
            +{quest.xp_reward} XP
          </span>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: 'tween', duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                quest.completed
                  ? 'bg-green-500'
                  : inProgress
                    ? isWeekly
                      ? 'bg-amber-400'
                      : 'bg-primary'
                    : 'bg-gray-300'
              )}
            />
          </div>
        </div>

        {quest.completed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white"
          >
            <Check className="h-4 w-4" />
          </motion.div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <span
          className={cn(
            quest.completed
              ? 'inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600'
              : 'rounded-pill px-3 py-1 text-xs font-bold',
            !quest.completed &&
              (inProgress
                ? isWeekly
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-purple-100 text-primary'
                : 'bg-gray-100 text-gray-600')
          )}
        >
          {quest.completed
            ? '✓ Completed'
            : inProgress
              ? 'In Progress'
              : 'Not Started'}
        </span>
      </div>

      {quest.completed ? (
        <p className="mt-3 text-center text-sm font-semibold text-green-600">Completed ✓</p>
      ) : (
        <Link
          href="/practice"
          className={cn(
            'mt-4 flex w-full items-center justify-center rounded-pill py-2.5 text-sm font-bold text-white transition hover:opacity-90',
            isWeekly ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/90'
          )}
        >
          Start Quest →
        </Link>
      )}
    </motion.div>
  );
}
