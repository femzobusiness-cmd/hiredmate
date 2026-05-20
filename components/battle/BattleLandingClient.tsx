'use client';

import {
  BATTLE_MODES,
  BATTLE_SPECIALTIES,
  type BattleMode,
} from '@/lib/battle';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type BattleStats = {
  nursesBattling: number;
  avgSurvival: number;
  topScore: number;
  topFive: { rank: number; name: string; score: number }[];
};

export function BattleLandingClient() {
  const router = useRouter();
  const [mode, setMode] = useState<BattleMode>('rapid-response');
  const [specialty, setSpecialty] = useState<string>(BATTLE_SPECIALTIES[0]);
  const [stats, setStats] = useState<BattleStats | null>(null);

  useEffect(() => {
    fetch('/api/battle/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {});
  }, []);

  const startBattle = () => {
    const params = new URLSearchParams({ mode, specialty });
    router.push(`/battle/session?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0533] to-[#2D1B69] px-4 py-8 text-white lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <p className="animate-bounce text-center text-5xl">⚡</p>
        <h1 className="mt-4 text-center text-5xl font-black">Battle Mode</h1>
        <p className="mt-4 text-center text-lg text-white/75">
          Rapid-fire nursing scenarios. Time pressure. Escalating difficulty. How
          long can you survive?
        </p>

        {stats && (
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-center text-sm text-white/60">
            <span>{stats.nursesBattling} nurses battling this week</span>
            <span>|</span>
            <span>Avg survival: {stats.avgSurvival} questions</span>
            <span>|</span>
            <span>Top score: {stats.topScore.toLocaleString()}</span>
          </div>
        )}

        <div className="mt-10 space-y-4">
          {BATTLE_MODES.map((m) => {
            const selected = mode === m.id;
            return (
              <motion.button
                key={m.id}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode(m.id)}
                className={cn(
                  'w-full rounded-[20px] border-2 p-5 text-left transition',
                  selected ? 'bg-white/10' : 'border-white/10 bg-white/5'
                )}
                style={{
                  borderColor: selected ? m.borderColor : undefined,
                  boxShadow: selected ? `0 0 24px ${m.borderColor}55` : undefined,
                }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <p className="mt-2 text-xl font-bold">{m.name}</p>
                <p className="mt-1 text-sm text-white/65">{m.description}</p>
              </motion.button>
            );
          })}
        </div>

        <p className="mt-8 text-sm font-semibold text-white/70">Specialty</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BATTLE_SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpecialty(s)}
              className={cn(
                'rounded-pill px-4 py-2 text-sm font-bold transition',
                specialty === s
                  ? 'bg-white text-[#1A0533]'
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startBattle}
          className="mt-10 w-full animate-pulse rounded-pill bg-gradient-to-r from-[#EF4444] to-[#DC2626] py-5 text-lg font-black text-white shadow-[0_8px_30px_rgba(239,68,68,0.45)]"
        >
          START BATTLE ⚡
        </motion.button>

        {stats && stats.topFive.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 rounded-[20px] border border-white/10 bg-white/5 p-6"
          >
            <h3 className="font-bold">This Week&apos;s Top Battlers</h3>
            <ul className="mt-4 space-y-2">
              {stats.topFive.map((row) => (
                <li
                  key={row.rank}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    #{row.rank} {row.name}
                  </span>
                  <span className="font-bold text-[#F59E0B]">
                    {row.score.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/battle/leaderboard"
              className="mt-4 inline-block text-sm font-bold text-[#00C6B2] hover:underline"
            >
              View Full Leaderboard →
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              emoji: '⏱️',
              title: '30 seconds',
              desc: 'Answer before timer hits zero or lose a life',
            },
            {
              emoji: '💥',
              title: 'Interruptions',
              desc: 'Mid-scenario alerts derail you just like real shifts',
            },
            {
              emoji: '⚡',
              title: 'Speed Bonus',
              desc: 'Answer in under 10 seconds for bonus XP',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-[20px] border border-white/10 bg-white/5 p-4"
            >
              <p className="text-2xl">{card.emoji}</p>
              <p className="mt-2 font-bold">{card.title}</p>
              <p className="mt-1 text-xs text-white/60">{card.desc}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
