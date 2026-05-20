'use client';

import type { NextStageInfo } from '@/lib/learning-path';
import { motion } from 'framer-motion';
import Link from 'next/link';

type CurrentStageWidgetProps = {
  nextStage: NextStageInfo | null;
  completedCount: number;
  totalStages: number;
};

export function CurrentStageWidget({
  nextStage,
  completedCount,
  totalStages,
}: CurrentStageWidgetProps) {
  if (!nextStage) return null;

  const percent = Math.round((completedCount / totalStages) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="overflow-hidden rounded-[20px] border border-border bg-white shadow-card"
    >
      <motion.div className="bg-gradient-to-r from-purple-50 via-white to-teal-50 px-5 py-4">
        <p className="text-sm font-bold text-text-primary">Continue Your Journey</p>
        <p className="mt-1 text-xs text-text-secondary">
          {nextStage.worldIcon} {nextStage.worldTitle}
        </p>
        <p className="font-semibold text-text-primary">{nextStage.stageTitle}</p>
      </motion.div>
      <motion.div className="px-5 py-4">
        <motion.div className="mb-2 flex justify-between text-xs font-semibold text-text-secondary">
          <span>
            Stage {nextStage.stageNumber}/{nextStage.totalStagesInWorld}
          </span>
          <span>
            {completedCount}/{totalStages} overall
          </span>
        </motion.div>
        <motion.div className="mb-4 h-2 overflow-hidden rounded-full bg-purple-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ type: 'tween', duration: 0.8 }}
            className="h-full bg-primary"
          />
        </motion.div>
        <Link
          href={`/learn/${nextStage.worldKey}/${nextStage.stageKey}`}
          className="flex w-full items-center justify-center rounded-pill bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90"
        >
          Resume Stage
        </Link>
      </motion.div>
    </motion.div>
  );
}
