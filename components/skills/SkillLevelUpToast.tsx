'use client';

import type { SkillLevelUpResult } from '@/lib/skill-progress';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export function SkillLevelUpToast({
  levelUp,
  onDismiss,
}: {
  levelUp: SkillLevelUpResult | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!levelUp?.leveledUp) return;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [levelUp, onDismiss]);

  return (
    <AnimatePresence>
      {levelUp?.leveledUp && (
        <motion.div
          initial={{ opacity: 0, x: 80, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed right-5 top-5 z-[80] max-w-sm overflow-hidden rounded-card border border-purple-50 bg-white shadow-[0_20px_60px_rgba(124,92,191,0.22)]"
          style={{ borderLeftWidth: 4, borderLeftColor: levelUp.skillColor }}
        >
          <div className="p-5">
            <p className="text-sm font-black text-text-primary">🎉 Skill Level Up!</p>
            <p className="mt-2 text-lg font-black text-text-primary">
              {levelUp.skillIcon} {levelUp.skillName}
            </p>
            <p className="mt-1 text-sm font-semibold text-text-secondary">
              Reached Level {levelUp.newLevel}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
