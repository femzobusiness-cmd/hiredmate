'use client';

import { getAchievementMeta } from '@/lib/community';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ShareAchievementModal } from './ShareAchievementModal';

export type EarnedAchievement = {
  id: string;
  achievement_key: string;
  earned_at: string;
};

type AchievementsTabProps = {
  achievements: EarnedAchievement[];
  userName: string;
};

export function AchievementsTab({ achievements, userName }: AchievementsTabProps) {
  const [shareTarget, setShareTarget] = useState<EarnedAchievement | null>(null);

  if (achievements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-[20px] bg-white p-12 text-center shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
      >
        <p className="text-4xl">🏅</p>
        <p className="mt-4 font-bold text-[#1a1a2e]">No achievements yet</p>
        <p className="mt-2 text-sm text-gray-500">
          Complete practice sessions to earn badges you can share.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {achievements.map((item, index) => {
          const meta = getAchievementMeta(item.achievement_key);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              <p className="text-4xl">{meta.emoji}</p>
              <p className="mt-3 font-bold text-[#1a1a2e]">{meta.title}</p>
              <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
              <p className="mt-2 text-[10px] text-gray-400">
                {new Date(item.earned_at).toLocaleDateString()}
              </p>
              <button
                type="button"
                onClick={() => setShareTarget(item)}
                className="mt-4 rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] px-4 py-2 text-xs font-bold text-white shadow-md"
              >
                Share 🔗
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <ShareAchievementModal
        open={!!shareTarget}
        onClose={() => setShareTarget(null)}
        achievementKey={shareTarget?.achievement_key || ''}
        earnedAt={shareTarget?.earned_at || new Date().toISOString()}
        userName={userName}
      />
    </>
  );
}
