'use client';

import type { NextStageInfo } from '@/lib/learning-path';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

type StageCompletionScreenProps = {
  passed: boolean;
  score: number;
  passingScore: number;
  stars: number;
  xpAwarded: number;
  isBoss: boolean;
  worldComplete: boolean;
  weakestQuestion?: string;
  nextStage: NextStageInfo | null;
  worldKey: string;
  onRetry: () => void;
};

export function StageCompletionScreen({
  passed,
  score,
  passingScore,
  stars,
  xpAwarded,
  isBoss,
  worldComplete,
  weakestQuestion,
  nextStage,
  worldKey,
  onRetry,
}: StageCompletionScreenProps) {
  useEffect(() => {
    if (!passed) return;
    confetti({
      particleCount: isBoss ? 400 : 200,
      spread: isBoss ? 140 : 90,
      origin: { y: 0.5 },
      colors: ['#7C5CBF', '#00C6B2', '#F59E0B', '#ffffff'],
    });
  }, [passed, isBoss]);

  if (!passed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-[24px] border border-red-100 bg-white p-8 text-center shadow-card"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
        >
          <X className="h-8 w-8 text-red-600" />
        </motion.div>
        <h2 className="mt-4 text-2xl font-black text-text-primary">Keep Practicing</h2>
        <p className="mt-2 text-text-secondary">
          You scored {score}%. Need {passingScore}% to pass.
        </p>
        {weakestQuestion && (
          <p className="mt-4 rounded-card bg-input p-3 text-left text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">Your toughest question:</span>
            <br />
            {weakestQuestion}
          </p>
        )}
        <p className="mt-4 text-sm text-text-secondary">
          Most nurses need 2–3 attempts. You&apos;ve got this! 🩺
        </p>
        <Button className="mt-6 w-full" onClick={onRetry}>
          Try Again →
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mx-auto max-w-lg rounded-[24px] p-8 text-center shadow-card',
        isBoss ? 'bg-gradient-to-br from-red-500 to-purple-700 text-white' : 'bg-white'
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        className={cn(
          'mx-auto flex h-20 w-20 items-center justify-center rounded-full',
          isBoss ? 'bg-white/20' : 'bg-green-100'
        )}
      >
        <Check className={cn('h-10 w-10', isBoss ? 'text-white' : 'text-green-600')} />
      </motion.div>

      <h2 className={cn('mt-4 text-3xl font-black', isBoss ? 'text-white' : 'text-text-primary')}>
        {isBoss ? '⚡ BOSS DEFEATED!' : 'Stage Complete! 🎉'}
      </h2>

      <div className="mt-4 flex justify-center gap-1">
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 24, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 400, damping: 14 }}
            className="text-3xl"
          >
            {i <= stars ? '⭐' : '☆'}
          </motion.span>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={cn('mt-3 text-2xl font-black', isBoss ? 'text-amber-300' : 'text-amber-600')}
      >
        +{xpAwarded} XP
      </motion.p>

      {worldComplete && (
        <p className={cn('mt-2 text-sm font-semibold', isBoss ? 'text-white/90' : 'text-primary')}>
          ✨ World complete! Next world unlocked.
        </p>
      )}

      <div className="mt-8 space-y-3">
        {nextStage ? (
          <Link href={`/learn/${nextStage.worldKey}/${nextStage.stageKey}`}>
            <Button className="w-full">Continue to Next Stage →</Button>
          </Link>
        ) : (
          <Link href={`/learn/${worldKey}`}>
            <Button variant="outline" className="w-full">
              Back to World
            </Button>
          </Link>
        )}
        <Link href="/learn">
          <Button variant="outline" className={cn('w-full', isBoss && 'border-white/40 text-white')}>
            Learning Path
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
