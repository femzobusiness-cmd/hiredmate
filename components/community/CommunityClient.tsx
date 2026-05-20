'use client';

import { AchievementsTab, type EarnedAchievement } from '@/components/community/AchievementsTab';
import { FriendsTab } from '@/components/community/FriendsTab';
import { LeaderboardTab } from '@/components/community/LeaderboardTab';
import { PageTransition } from '@/components/ui/PageTransition';
import type { LeaderboardResponse } from '@/lib/community';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

const TABS = [
  { id: 'leaderboard', label: '🏆 Leaderboard' },
  { id: 'friends', label: '👥 Friends' },
  { id: 'achievements', label: '🎖️ Achievements' },
] as const;

type TabId = (typeof TABS)[number]['id'];

type CommunityClientProps = {
  userName: string;
  initialAchievements: EarnedAchievement[];
};

export function CommunityClient({
  userName,
  initialAchievements,
}: CommunityClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('leaderboard');
  const [period, setPeriod] = useState<'week' | 'alltime'>('week');
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [lbLoading, setLbLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async (p: 'week' | 'alltime') => {
    setLbLoading(true);
    const res = await fetch(`/api/community/leaderboard?period=${p}`);
    const data = await res.json();
    if (res.ok) setLeaderboard(data);
    setLbLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard(period);
    }
  }, [activeTab, period, loadLeaderboard]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <PageTransition>
      <motion.div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C5CBF]">
          COMMUNITY
        </p>
        <h1 className="mt-2 text-4xl font-black text-[#1a1a2e]">
          Compete & Connect 🏆
        </h1>
        <p className="mt-3 text-gray-600">
          See how you rank against nurses nationwide and challenge your friends.
        </p>

        <div className="relative mt-8 flex flex-wrap gap-2 rounded-pill bg-white p-1.5 shadow-[0_4px_20px_rgba(124,92,191,0.08)]">
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative z-10 rounded-pill px-4 py-2.5 text-sm font-bold transition-colors',
                  selected ? 'text-white' : 'text-gray-500'
                )}
              >
                {selected && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-pill bg-[#7C5CBF]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <LeaderboardTab
                  data={leaderboard}
                  period={period}
                  onPeriodChange={setPeriod}
                  loading={lbLoading}
                />
              </motion.div>
            )}
            {activeTab === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <FriendsTab onToast={showToast} />
              </motion.div>
            )}
            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <AchievementsTab
                  achievements={initialAchievements}
                  userName={userName}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white shadow-lg lg:bottom-8"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
}
