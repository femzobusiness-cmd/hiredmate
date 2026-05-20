'use client';

import type { QuestWithProgress } from '@/lib/quests';
import { getProgressPercent } from '@/lib/quests';
import { motion } from 'framer-motion';
import Link from 'next/link';

type QuestWidgetProps = {
  quests: QuestWithProgress[];
};

export function QuestWidget({ quests }: QuestWidgetProps) {
  const preview = quests.slice(0, 3);
  const completed = quests.filter((q) => q.completed).length;
  const total = quests.length || 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="overflow-hidden rounded-[20px] border border-border bg-white shadow-card"
    >
      <div className="bg-gradient-to-r from-purple-50 via-white to-teal-50 px-5 py-4">
        <h3 className="font-bold text-text-primary">Today&apos;s Quests</h3>
        <p className="text-sm text-text-secondary">
          {completed}/{total} completed
        </p>
      </div>
      <div className="space-y-3 p-4">
        {preview.map((quest) => {
          const percent = getProgressPercent(quest, quest.progress);
          return (
            <div key={quest.key} className="flex items-center gap-3">
              <span className="text-xl">{quest.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {quest.title}
                </p>
                <motion.div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: 'tween', duration: 0.6 }}
                    className={
                      quest.completed ? 'h-full bg-green-500' : 'h-full bg-primary'
                    }
                  />
                </motion.div>
              </div>
              <span className="shrink-0 text-xs font-bold text-amber-700">
                +{quest.xp_reward}
              </span>
            </div>
          );
        })}
      </div>
      <Link
        href="/quests"
        className="block border-t border-border px-5 py-3 text-center text-sm font-bold text-primary hover:bg-purple-50/50"
      >
        View All Quests →
      </Link>
    </motion.div>
  );
}
