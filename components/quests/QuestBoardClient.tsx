'use client';

import { QuestCard } from '@/components/quests/QuestCard';
import { QuestCompleteToast } from '@/components/quests/QuestCompleteToast';
import Button from '@/components/ui/Button';
import type { CompletedQuest, QuestWithProgress } from '@/lib/quests';
import {
  getDaysUntilWeeklyReset,
  getTimeUntilDailyReset,
} from '@/lib/quests';
import { motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type QuestBoardClientProps = {
  initialDaily: QuestWithProgress[];
  initialWeekly: QuestWithProgress[];
};

export function QuestBoardClient({
  initialDaily,
  initialWeekly,
}: QuestBoardClientProps) {
  const [daily, setDaily] = useState(initialDaily);
  const [weekly, setWeekly] = useState(initialWeekly);
  const [resetLabel, setResetLabel] = useState(getTimeUntilDailyReset().label);
  const [toastQuest, setToastQuest] = useState<CompletedQuest | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const dailyCompleted = daily.filter((q) => q.completed).length;
  const daysLeft = getDaysUntilWeeklyReset();
  const hasQuests = daily.length > 0 || weekly.length > 0;

  useEffect(() => {
    const tick = () => setResetLabel(getTimeUntilDailyReset().label);
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/quests', { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load quests');
      }
      const nextDaily = (data.daily || []) as QuestWithProgress[];
      const nextWeekly = (data.weekly || []) as QuestWithProgress[];
      if (nextDaily.length > 0 || nextWeekly.length > 0) {
        setDaily(nextDaily);
        setWeekly(nextWeekly);
        setLoadError(null);
      } else {
        setLoadError(
          'No quests found. Run the quests SQL in Supabase and ensure the read policy is enabled.'
        );
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <motion.div className="mx-auto max-w-4xl space-y-10">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Mission Board
        </p>
        <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
          Daily Quests 🎯
        </h1>
        <p className="text-text-secondary">
          Complete quests to earn bonus XP and level up faster
        </p>
        <div className="inline-flex items-center gap-2 rounded-pill bg-white px-4 py-2 text-sm font-semibold text-text-secondary shadow-card">
          <Clock className="h-4 w-4 text-primary" />
          Resets in: {resetLabel}
        </div>
      </motion.header>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-card bg-white py-12 shadow-card">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-semibold text-text-secondary">Loading quests…</span>
        </div>
      )}

      {!loading && !hasQuests && (
        <div className="rounded-[20px] border border-border bg-white p-10 text-center shadow-card">
          <p className="text-lg font-bold text-text-primary">No quests found</p>
          <p className="mt-2 text-sm text-text-secondary">
            {loadError ||
              'Quest data could not be loaded. Run the quests SQL migration in Supabase.'}
          </p>
          <Button className="mt-6" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      )}

      {hasQuests && !loading && (
        <>
          <section className="space-y-4">
            <motion.div>
              <h2 className="text-xl font-bold text-text-primary">Today&apos;s Quests</h2>
              <p className="text-sm text-text-secondary">
                Resets at midnight · {dailyCompleted}/{daily.length || 5} completed
              </p>
            </motion.div>
            {daily.length === 0 ? (
              <p className="text-sm text-text-secondary">No daily quests available.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {daily.map((quest, index) => (
                  <QuestCard key={quest.key} quest={quest} index={index} variant="daily" />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-text-primary">This Week&apos;s Challenges</h2>
              <p className="text-sm text-text-secondary">
                Resets every Monday · {daysLeft} days left
              </p>
            </motion.div>
            {weekly.length === 0 ? (
              <p className="text-sm text-text-secondary">No weekly quests available.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {weekly.map((quest, index) => (
                  <QuestCard key={quest.key} quest={quest} index={index} variant="weekly" />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <QuestCompleteToast quest={toastQuest} onDismiss={() => setToastQuest(null)} />
    </motion.div>
  );
}
