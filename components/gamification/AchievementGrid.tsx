import { ACHIEVEMENTS } from '@/lib/gamification';
import { cn } from '@/utils/cn';
import { Lock } from 'lucide-react';

type AchievementGridProps = {
  earnedKeys: string[];
};

export default function AchievementGrid({ earnedKeys }: AchievementGridProps) {
  const earned = new Set(earnedKeys);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {ACHIEVEMENTS.map((achievement) => {
        const isEarned = earned.has(achievement.key);
        return (
          <div
            key={achievement.key}
            title={achievement.description}
            className={cn(
              'rounded-card border p-4 text-center transition-all hover:-translate-y-1 hover:shadow-card-hover',
              isEarned
                ? 'border-primary/30 bg-white opacity-100'
                : 'border-border bg-border/40 opacity-40'
            )}
          >
            <div className="mb-2 text-3xl">
              {isEarned ? achievement.emoji : <Lock className="mx-auto h-8 w-8" />}
            </div>
            <p className="text-sm font-bold text-text-primary">{achievement.title}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {achievement.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
