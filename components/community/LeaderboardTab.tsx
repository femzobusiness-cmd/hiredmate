'use client';

import type { LeaderboardResponse } from '@/lib/community';
import { getInitials, rankCrown, rankDisplayColor } from '@/lib/community';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

type LeaderboardTabProps = {
  data: LeaderboardResponse | null;
  period: 'week' | 'alltime';
  onPeriodChange: (period: 'week' | 'alltime') => void;
  loading: boolean;
};

export function LeaderboardTab({
  data,
  period,
  onPeriodChange,
  loading,
}: LeaderboardTabProps) {
  const specialty = data?.currentUser.specialty || 'nursing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex gap-2">
        {(['week', 'alltime'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPeriodChange(p)}
            className={cn(
              'rounded-pill px-5 py-2 text-sm font-bold transition',
              period === p
                ? 'bg-[#7C5CBF] text-white shadow-md'
                : 'bg-white text-gray-600 shadow-sm'
            )}
          >
            {p === 'week' ? 'This Week' : 'All Time'}
          </button>
        ))}
      </div>

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border-l-4 border-[#7C5CBF] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#7C5CBF]">
            Your Rank
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <p className="text-5xl font-black text-[#1a1a2e]">
              #{data.currentUser.rank}
            </p>
            <p className="text-sm font-bold text-[#00C6B2]">
              Top {data.currentUser.topPercent}% of nurses
            </p>
          </div>
          <div className="mt-4 flex gap-6 text-sm text-gray-600">
            <span>
              <span className="font-bold text-[#1a1a2e]">
                {data.currentUser.weeklyXp.toLocaleString()}
              </span>{' '}
              XP this week
            </span>
            <span>
              <span className="font-bold text-[#1a1a2e]">
                {data.currentUser.totalXp.toLocaleString()}
              </span>{' '}
              Total XP
            </span>
          </div>
        </motion.div>
      )}

      {loading ? (
        <p className="py-12 text-center text-[#7C5CBF]">Loading leaderboard...</p>
      ) : (
        <div className="space-y-3">
          {data?.entries.map((entry, index) => {
            const rank = index + 1;
            const crown = rankCrown(rank);
            const color = rankDisplayColor(rank);

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ boxShadow: '0 12px 32px rgba(124,92,191,0.12)' }}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
              >
                <span
                  className="w-10 text-center text-lg font-black"
                  style={{ color: rank <= 3 ? color : '#9CA3AF' }}
                >
                  {crown ? `${crown} ` : ''}#{rank}
                </span>
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {getInitials(entry.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#1a1a2e]">{entry.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {entry.specialty && (
                      <span className="rounded-pill bg-[#F8F7FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C5CBF]">
                        {entry.specialty}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{entry.rankTitle}</span>
                  </div>
                </div>
                <p className="shrink-0 text-lg font-black text-[#F59E0B]">
                  {(period === 'week' ? entry.weeklyXp : entry.totalXp).toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-gray-500">XP</span>
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[20px] bg-[#00C6B2]/10 px-6 py-4 text-center text-sm font-semibold text-[#00C6B2]"
        >
          You&apos;re in the top {data.currentUser.topPercent}% of {specialty} nurses
        </motion.div>
      )}
    </motion.div>
  );
}
