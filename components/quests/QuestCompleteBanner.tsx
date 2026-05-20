'use client';

import type { CompletedQuest } from '@/lib/quests';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export function QuestCompleteBanner({
  quest,
  onDismiss,
}: {
  quest: CompletedQuest | null;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {quest && (
        <motion.div
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 120 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed inset-x-4 bottom-6 z-[75] mx-auto max-w-md rounded-[20px] bg-purple-gradient p-5 text-white shadow-[0_24px_60px_rgba(124,92,191,0.45)]"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            🎯 Quest Complete!
          </p>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-2 flex items-center gap-3"
          >
            <span className="text-4xl">{quest.icon}</span>
            <div>
              <p className="text-xl font-black">{quest.title}</p>
              <p className="text-2xl font-black text-amber-300">+{quest.xpReward} XP</p>
            </div>
          </motion.div>
          <Button
            className="mt-4 w-full bg-white text-primary hover:bg-white/90"
            onClick={onDismiss}
          >
            Keep going!
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
