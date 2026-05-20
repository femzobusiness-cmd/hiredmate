import { getRankForXp, getXpForScore, ACHIEVEMENTS } from '@/lib/gamification';

export type LeaderboardEntry = {
  userId: string;
  name: string;
  specialty: string | null;
  rankTitle: string;
  rankLevel: number;
  totalXp: number;
  weeklyXp: number;
  currentStreak: number;
};

export type LeaderboardResponse = {
  period: 'week' | 'alltime';
  entries: LeaderboardEntry[];
  currentUser: {
    rank: number;
    weeklyXp: number;
    totalXp: number;
    topPercent: number;
    specialty: string | null;
  };
};

export function getMondayUtc(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff)
  );
  return monday.toISOString();
}

export function sessionXp(score: number | null): number {
  if (score == null) return 10;
  return getXpForScore(Math.round(score), 'written');
}

export function rankDisplayColor(rank: number): string {
  if (rank === 1) return '#F59E0B';
  if (rank === 2) return '#9CA3AF';
  if (rank === 3) return '#D97706';
  return '#9CA3AF';
}

export function rankCrown(rank: number): string | null {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'HM';
}

export function getAchievementMeta(key: string) {
  return ACHIEVEMENTS.find((item) => item.key === key) || {
    key,
    title: key.replace(/_/g, ' '),
    emoji: '🏅',
    description: 'Achievement unlocked',
  };
}

export function topPercent(rank: number, total: number): number {
  if (total <= 0) return 100;
  return Math.max(1, Math.min(100, Math.round((rank / total) * 100)));
}

export function buildLeaderboard(
  profiles: {
    user_id: string;
    first_name: string | null;
    specialty: string | null;
    rank_title: string;
    rank_level: number;
    total_xp: number;
    current_streak: number;
  }[],
  weeklyXpByUser: Map<string, number>,
  period: 'week' | 'alltime',
  currentUserId: string
): LeaderboardResponse {
  const withWeekly = profiles.map((profile) => ({
    userId: profile.user_id,
    name: profile.first_name?.trim() || 'Nurse',
    specialty: profile.specialty,
    rankTitle: profile.rank_title || getRankForXp(profile.total_xp).title,
    rankLevel: profile.rank_level,
    totalXp: profile.total_xp || 0,
    weeklyXp: weeklyXpByUser.get(profile.user_id) || 0,
    currentStreak: profile.current_streak || 0,
  }));

  const sorted =
    period === 'week'
      ? [...withWeekly].sort((a, b) => b.weeklyXp - a.weeklyXp)
      : [...withWeekly].sort((a, b) => b.totalXp - a.totalXp);

  const entries = sorted.slice(0, 50);
  const xpKey = period === 'week' ? 'weeklyXp' : 'totalXp';
  const currentIndex = sorted.findIndex((e) => e.userId === currentUserId);
  const currentEntry =
    currentIndex >= 0 ? sorted[currentIndex] : withWeekly.find((e) => e.userId === currentUserId);

  return {
    period,
    entries,
    currentUser: {
      rank: currentIndex >= 0 ? currentIndex + 1 : sorted.length + 1,
      weeklyXp: currentEntry?.weeklyXp || 0,
      totalXp: currentEntry?.totalXp || 0,
      topPercent: topPercent(
        currentIndex >= 0 ? currentIndex + 1 : sorted.length + 1,
        sorted.length || 1
      ),
      specialty: currentEntry?.specialty || null,
    },
  };
}
