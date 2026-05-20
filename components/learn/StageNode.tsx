'use client';

import type { StageWithProgress } from '@/lib/learning-path';
import {
  formatStageType,
  getStageTypeBadgeColor,
} from '@/lib/learning-path';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Check, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

type StageNodeProps = {
  stage: StageWithProgress;
  worldKey: string;
  index: number;
};

export function StageNode({ stage, worldKey, index }: StageNodeProps) {
  const isLocked = stage.status === 'locked';
  const isCurrent = stage.status === 'current';
  const isComplete = stage.status === 'completed';
  const stars = stage.progress?.stars || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center">
        <motion.div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 text-lg font-bold',
            isComplete && 'border-green-500 bg-green-500 text-white',
            isCurrent &&
              !stage.is_boss_stage &&
              'border-primary bg-white text-primary shadow-[0_0_0_6px_rgba(124,92,191,0.25)]',
            isCurrent &&
              stage.is_boss_stage &&
              'border-red-500 bg-red-50 text-red-600 shadow-[0_0_20px_rgba(239,68,68,0.35)]',
            isLocked && 'border-gray-200 bg-gray-100 text-gray-400'
          )}
          animate={isCurrent ? { scale: [1, 1.06] } : {}}
          transition={
            isCurrent
              ? { type: 'tween', duration: 1.2, repeat: Infinity, repeatType: 'reverse' }
              : undefined
          }
        >
          {isComplete ? (
            <Check className="h-6 w-6" />
          ) : isLocked ? (
            <Lock className="h-5 w-5" />
          ) : (
            stage.stage_number
          )}
        </motion.div>
        <div className="mt-2 h-full min-h-[24px] w-0.5 bg-purple-200" />
      </div>

      <div
        className={cn(
          'mb-6 flex-1 rounded-[20px] border bg-white p-5 shadow-card',
          isLocked && 'opacity-60',
          stage.is_boss_stage && isCurrent && 'border-red-200 ring-2 ring-red-100'
        )}
      >
        <motion.div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            {stage.is_boss_stage && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-pill bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                <Zap className="h-3 w-3" /> BOSS
              </span>
            )}
            <h3
              className={cn(
                'font-bold',
                isLocked ? 'text-text-muted' : 'text-text-primary'
              )}
            >
              {stage.title}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">{stage.description}</p>
          </div>
          <span className="rounded-pill bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
            +{stage.xp_reward} XP
          </span>
        </motion.div>

        {isComplete && (
          <motion.div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-lg">
              {'⭐'.repeat(stars)}
              {'☆'.repeat(Math.max(0, 3 - stars))}
            </span>
            <span className="rounded-pill bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              Best: {stage.progress?.best_score || 0}%
            </span>
            <Link
              href={`/learn/${worldKey}/${stage.key}`}
              className="text-sm font-bold text-primary hover:underline"
            >
              Replay
            </Link>
          </motion.div>
        )}

        {isCurrent && (
          <motion.div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-pill px-2 py-0.5 text-xs font-bold',
                getStageTypeBadgeColor(stage.stage_type)
              )}
            >
              {formatStageType(stage.stage_type)}
            </span>
            {stage.is_boss_stage && (
              <span className="rounded-pill bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                ⚡ BOSS BATTLE
              </span>
            )}
            <Link
              href={`/learn/${worldKey}/${stage.key}`}
              className={cn(
                'ml-auto rounded-pill px-4 py-2 text-sm font-bold text-white',
                stage.is_boss_stage ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
              )}
            >
              Start Stage →
            </Link>
          </motion.div>
        )}

        {isLocked && (
          <p className="mt-3 text-sm text-text-muted">Complete the previous stage</p>
        )}
      </div>
    </motion.div>
  );
}
