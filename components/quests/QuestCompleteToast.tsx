'use client';

import type { CompletedQuest } from '@/lib/quests';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export function QuestCompleteToast({
  quest,
  onDismiss,
}: {
  quest: CompletedQuest | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!quest) return;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [quest, onDismiss]);

  return (
    <AnimatePresence>
      {quest && (
        <motion.div
          initial={{ opacity: 0, x: 80, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed right-5 top-24 z-[85] max-w-sm overflow-hidden rounded-card border border-purple-50 bg-white shadow-[0_20px_60px_rgba(124,92,191,0.22)]"
          style={{ borderLeftWidth: 4, borderLeftColor: '#7C5CBF' }}
        >
          <div className="p-5">
            <p className="text-sm font-black text-text-primary">🎯 Quest Complete!</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-black text-text-primary">
              <span>{quest.icon}</span>
              {quest.title}
            </p>
            <p className="mt-1 text-sm font-bold text-amber-600">+{quest.xpReward} XP earned</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
