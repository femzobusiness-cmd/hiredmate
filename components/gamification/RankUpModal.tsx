'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Rank } from '@/lib/gamification';

type RankUpModalProps = {
  oldRank: Rank;
  newRank: Rank;
  onContinue: () => void;
};

export default function RankUpModal({
  oldRank,
  newRank,
  onContinue,
}: RankUpModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-text-primary/60 px-4 backdrop-blur-sm">
      <Card className="max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-purple-gradient text-5xl shadow-button">
          {newRank.emoji}
        </div>
        <div>
          <p className="text-4xl font-black text-primary">RANK UP!</p>
          <p className="mt-3 text-text-secondary">
            {oldRank.emoji} {oldRank.title} → {newRank.emoji} {newRank.title}
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-pill bg-border">
          <div className="h-full w-full rounded-pill bg-purple-gradient" />
        </div>
        <Button className="w-full" onClick={onContinue}>
          Continue
        </Button>
      </Card>
    </div>
  );
}
