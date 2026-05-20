'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function BattleWidget() {
  const [weeklyBest, setWeeklyBest] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/battle/leaderboard?period=week')
      .then((res) => res.json())
      .then((data) => {
        const me = data.entries?.find(
          (e: { isCurrentUser: boolean }) => e.isCurrentUser
        );
        if (me) setWeeklyBest(me.score);
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="rounded-[20px] bg-gradient-to-br from-[#1A0533] to-[#2D1B69] p-6 shadow-[0_8px_30px_rgba(124,92,191,0.2)]"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-white">⚡ Battle Mode</h3>
        <span className="rounded-full bg-[#EF4444] px-2 py-0.5 text-[10px] font-bold text-white">
          NEW
        </span>
      </div>
      <p className="mt-2 text-sm text-white/75">
        Rapid-fire scenarios. 30 seconds. How long can you survive?
      </p>
      {weeklyBest != null && (
        <p className="mt-3 text-sm text-white/90">
          Your best this week:{' '}
          <span className="font-black text-[#F59E0B]">
            {weeklyBest.toLocaleString()}
          </span>
        </p>
      )}
      <Link
        href="/battle"
        className="mt-5 flex w-full items-center justify-center rounded-pill bg-gradient-to-r from-[#EF4444] to-[#DC2626] py-3 text-sm font-bold text-white shadow-md"
      >
        Start Battle ⚡
      </Link>
    </motion.div>
  );
}
