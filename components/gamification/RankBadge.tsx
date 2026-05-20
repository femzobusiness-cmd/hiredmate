import { getRankProgress } from '@/lib/gamification';
import { cn } from '@/utils/cn';

type RankBadgeProps = {
  level?: number | null;
  totalXp?: number | null;
  title?: string | null;
  showProgress?: boolean;
  compact?: boolean;
};

function rankColor(level: number) {
  if (level >= 13) return 'bg-gradient-to-r from-red-500 to-primary text-white';
  if (level >= 10) return 'bg-gold/20 text-amber-700';
  if (level >= 7) return 'bg-secondary/15 text-secondary';
  if (level >= 4) return 'bg-primary/15 text-primary';
  return 'bg-border text-text-secondary';
}

export default function RankBadge({
  totalXp = 0,
  title,
  showProgress = false,
  compact = false,
}: RankBadgeProps) {
  const progress = getRankProgress(totalXp || 0);
  const rank = progress.current;

  return (
    <div className={cn('space-y-2', compact && 'space-y-1')}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-bold',
          rankColor(rank.level)
        )}
      >
        <span>{rank.emoji}</span>
        <span>{title || rank.title}</span>
      </span>
      {showProgress && (
        <div className="space-y-1">
          <div className="h-1.5 overflow-hidden rounded-pill bg-border">
            <div
              className="h-full rounded-pill bg-purple-gradient transition-all duration-700"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <p className="text-[11px] font-medium text-text-muted">
            {progress.next ? `${progress.xpToNext} XP to next rank` : 'Max rank'}
          </p>
        </div>
      )}
    </div>
  );
}
