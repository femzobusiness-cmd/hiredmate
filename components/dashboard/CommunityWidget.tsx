'use client';

import { getInitials } from '@/lib/community';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type WidgetPreview = {
  rank: number;
  topPercent: number;
  topThree: { name: string; xp: number }[];
};

export function CommunityWidget() {
  const [preview, setPreview] = useState<WidgetPreview | null>(null);

  useEffect(() => {
    fetch('/api/community/leaderboard?period=week')
      .then((res) => res.json())
      .then((data) => {
        if (!data.entries) return;
        setPreview({
          rank: data.currentUser?.rank || 0,
          topPercent: data.currentUser?.topPercent || 0,
          topThree: data.entries.slice(0, 3).map(
            (e: { name: string; weeklyXp: number }) => ({
              name: e.name,
              xp: e.weeklyXp,
            })
          ),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-[#1a1a2e]">🏆 Community</h3>
        <span className="rounded-full bg-[#00C6B2] px-2 py-0.5 text-[10px] font-bold text-white">
          NEW
        </span>
      </div>

      {preview ? (
        <>
          <p className="mt-3 text-sm text-gray-600">
            You&apos;re ranked{' '}
            <span className="font-black text-[#7C5CBF]">#{preview.rank}</span> this
            week
          </p>
          <div className="mt-4 space-y-2">
            {preview.topThree.map((user, i) => (
              <div
                key={user.name + i}
                className="flex items-center gap-3 rounded-xl bg-[#F8F7FF] px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C5CBF] text-xs font-bold text-white">
                  {getInitials(user.name)}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1a1a2e]">
                  {user.name}
                </span>
                <span className="text-xs font-bold text-[#F59E0B]">
                  {user.xp} XP
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-gray-500">Loading community stats...</p>
      )}

      <Link
        href="/community"
        className="mt-5 flex w-full items-center justify-center rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] py-3 text-sm font-bold text-white shadow-md"
      >
        View Leaderboard →
      </Link>
    </motion.div>
  );
}
