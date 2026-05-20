'use client';

import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Entry = {
  rank: number;
  userId: string;
  name: string;
  specialty: string | null;
  score: number;
  battlesPlayed: number;
  bestStreak: number;
  initials: string;
  isCurrentUser: boolean;
};

export function BattleLeaderboardClient() {
  const [period, setPeriod] = useState<'week' | 'alltime'>('week');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/battle/leaderboard?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.entries) setEntries(data.entries);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumOrder = [
    podium[1] ? { entry: podium[1], place: 2, height: 'h-24' } : null,
    podium[0] ? { entry: podium[0], place: 1, height: 'h-32' } : null,
    podium[2] ? { entry: podium[2], place: 3, height: 'h-20' } : null,
  ].filter(Boolean) as {
    entry: Entry;
    place: number;
    height: string;
  }[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-[#1A0533] to-[#2D1B69] px-4 py-8 text-white"
    >
      <Link
        href="/battle"
        className="text-sm font-semibold text-white/70 hover:text-white"
      >
        ← Back to Battle
      </Link>

      <h1 className="mt-6 text-4xl font-black">Battle Leaderboard</h1>

      <div className="mt-6 flex gap-2">
        {(['week', 'alltime'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              'rounded-pill px-5 py-2 text-sm font-bold',
              period === p
                ? 'bg-[#EF4444] text-white'
                : 'bg-white/10 text-white/70'
            )}
          >
            {p === 'week' ? 'This Week' : 'All Time'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-12 text-center text-white/60">Loading...</p>
      ) : (
        <>
          {podium.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 flex items-end justify-center gap-4"
            >
              {podiumOrder.map(({ entry, place, height }) => (
                <motion.div
                  key={entry.userId}
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold',
                      place === 1
                        ? 'bg-[#F59E0B] text-[#1A0533]'
                        : 'bg-white/20'
                    )}
                  >
                    {entry.initials}
                  </div>
                  <p className="mt-2 max-w-[100px] truncate text-center text-sm font-bold">
                    {place === 1 && '👑 '}
                    {entry.name}
                  </p>
                  <p className="text-xs text-[#F59E0B]">
                    {entry.score.toLocaleString()}
                  </p>
                  <div
                    className={cn(
                      'mt-2 w-24 rounded-t-xl bg-gradient-to-t from-[#7C5CBF] to-[#EF4444]/80',
                      height
                    )}
                  />
                  <p className="py-2 text-lg font-black">#{place}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mx-auto mt-10 max-w-2xl space-y-2">
            {rest.map((entry) => (
              <motion.div
                key={entry.userId}
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-center gap-4 rounded-2xl bg-white/5 p-4',
                  entry.isCurrentUser && 'border-l-4 border-[#7C5CBF] bg-white/10'
                )}
              >
                <span className="w-8 font-black text-white/50">#{entry.rank}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C5CBF] text-xs font-bold">
                  {entry.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{entry.name}</p>
                  <p className="text-xs text-white/50">
                    {entry.battlesPlayed} battles · best streak {entry.bestStreak}
                  </p>
                </div>
                <span className="font-black text-[#F59E0B]">
                  {entry.score.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
