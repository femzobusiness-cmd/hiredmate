'use client';

import {
  formatDuration,
  getPersonalityConfig,
  gradeColor,
  scoreBadgeColor,
  type MockInterviewDebrief,
  type PersonalityMode,
} from '@/lib/mock-interview';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const LOADING_LINES = [
  'Reviewing your answers...',
  'Identifying strengths...',
  'Calculating your score...',
];

function DebriefContent() {
  const searchParams = useSearchParams();
  const interviewId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [loadingLine, setLoadingLine] = useState(0);
  const [debrief, setDebrief] = useState<MockInterviewDebrief | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [meta, setMeta] = useState<{
    personality: PersonalityMode;
    specialty: string;
    durationSeconds: number;
    questionCount: number;
  } | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) {
      setError('No interview ID provided');
      setLoading(false);
      return;
    }

    const load = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: row, error: fetchError } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (fetchError || !row) {
        setError('Interview not found');
        setLoading(false);
        return;
      }

      const conversation = (row.conversation || []) as {
        role: string;
        content: string;
      }[];
      const personality = (row.personality_mode || 'neutral') as PersonalityMode;

      setMeta({
        personality,
        specialty: row.specialty || 'General Nursing',
        durationSeconds: row.duration_seconds || 0,
        questionCount: conversation.filter((m) => m.role === 'user').length,
      });

      if (row.debrief && typeof row.debrief === 'object') {
        setDebrief(row.debrief as MockInterviewDebrief);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/mock-interview/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation,
          personality: row.personality_mode,
          specialty: row.specialty,
          hospital_id: row.hospital_id,
          interviewId: row.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate debrief');
        setLoading(false);
        return;
      }

      setDebrief(data as MockInterviewDebrief);
      setLoading(false);
    };

    load();
  }, [interviewId]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingLine((i) => (i + 1) % LOADING_LINES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!debrief) return;
    const target = debrief.overallScore;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [debrief]);

  if (loading) {
    return (
      <motion.div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F8F7FF] px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-[#7C5CBF]/20 border-t-[#7C5CBF]"
        />
        <p className="mt-6 text-lg font-bold text-[#1a1a2e]">
          Analyzing your interview...
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingLine}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 text-sm text-gray-500"
          >
            {LOADING_LINES[loadingLine]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    );
  }

  if (error || !debrief || !meta) {
    return (
      <motion.div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-500">{error || 'Something went wrong'}</p>
        <Link
          href="/mock-interview"
          className="mt-4 inline-block text-[#7C5CBF] hover:underline"
        >
          Back to setup
        </Link>
      </motion.div>
    );
  }

  const personalityConfig = getPersonalityConfig(meta.personality);

  return (
    <motion.div className="min-h-screen bg-[#F8F7FF] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-[#1a1a2e]">
            Interview Complete 🎙️
          </h1>
          <motion.div className="mt-3 flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: personalityConfig.color }}
            >
              {personalityConfig.name}
            </span>
            <span className="rounded-full bg-[#7C5CBF]/10 px-3 py-1 text-xs font-bold text-[#7C5CBF]">
              {meta.specialty}
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-[20px] bg-white p-8 text-center shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
        >
          <p className="text-6xl font-black text-[#7C5CBF]">{displayScore}</p>
          <span
            className="mt-2 inline-block rounded-full px-4 py-1 text-lg font-black text-white"
            style={{ backgroundColor: gradeColor(debrief.overallGrade) }}
          >
            {debrief.overallGrade}
          </span>
          <p className="mx-auto mt-4 max-w-lg text-gray-600">{debrief.summary}</p>
          <motion.div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <motion.div>
              <p className="text-xs text-gray-500">Questions Answered</p>
              <p className="text-lg font-bold text-[#1a1a2e]">
                {meta.questionCount}
              </p>
            </motion.div>
            <motion.div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-lg font-bold text-[#1a1a2e]">
                {formatDuration(meta.durationSeconds)}
              </p>
            </motion.div>
            <motion.div>
              <p className="text-xs text-gray-500">Overall Grade</p>
              <p className="text-lg font-bold text-[#1a1a2e]">
                {debrief.overallGrade}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="mb-4 text-lg font-bold text-[#1a1a2e]">
            ✅ What You Did Well
          </h2>
          <motion.div className="space-y-3">
            {debrief.strengths.map((s) => (
              <motion.div
                key={s.title}
                className="rounded-[20px] border-l-4 border-green-500 bg-white p-5 shadow-sm"
              >
                <p className="font-bold text-[#1a1a2e]">{s.title}</p>
                <p className="mt-1 text-sm text-gray-600">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="mb-4 text-lg font-bold text-[#1a1a2e]">
            📈 Areas to Improve
          </h2>
          <motion.div className="space-y-3">
            {debrief.improvements.map((item) => (
              <motion.div
                key={item.title}
                className="rounded-[20px] border-l-4 border-amber-500 bg-white p-5 shadow-sm"
              >
                <p className="font-bold text-[#1a1a2e]">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="mb-4 text-lg font-bold text-[#1a1a2e]">
            📋 Question by Question
          </h2>
          <motion.div className="space-y-2">
            {debrief.questionBreakdown.map((q, i) => (
              <motion.div
                key={q.question}
                className="overflow-hidden rounded-[20px] bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="flex-1 text-sm font-medium text-[#1a1a2e]">
                    {q.question}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: scoreBadgeColor(q.score) }}
                  >
                    {q.score}
                  </span>
                </button>
                <AnimatePresence>
                  {expandedQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 px-4 pb-4"
                    >
                      <p className="mt-3 text-xs font-semibold text-gray-500">
                        Your answer
                      </p>
                      <p className="text-sm text-gray-700">{q.answerSummary}</p>
                      <p className="mt-3 text-xs font-semibold text-[#7C5CBF]">
                        Feedback
                      </p>
                      <p className="text-sm text-gray-700">{q.feedback}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-[20px] bg-gradient-to-br from-[#00C6B2] to-[#00A896] p-6 text-white shadow-lg"
        >
          <h3 className="text-lg font-bold">⭐ Your Best Answer</h3>
          <p className="mt-2 font-medium">{debrief.bestAnswer.question}</p>
          <p className="mt-2 text-sm text-white/90">{debrief.bestAnswer.why}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-4 rounded-[20px] bg-red-50 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-red-800">⚠️ Your Weakest Answer</h3>
          <p className="mt-2 font-medium text-red-900">
            {debrief.weakestAnswer.question}
          </p>
          <p className="mt-2 text-sm text-red-700">{debrief.weakestAnswer.why}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-[20px] bg-[#F59E0B]/10 p-6"
        >
          <h3 className="text-lg font-bold text-[#1a1a2e]">
            💡 Top 3 Recommendations
          </h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5">
            {debrief.topRecommendations.map((rec) => (
              <li key={rec} className="text-sm font-semibold text-gray-800">
                {rec}
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/mock-interview"
            className="flex-1 rounded-full border-2 border-[#7C5CBF] py-3 text-center text-sm font-bold text-[#7C5CBF]"
          >
            Practice Again
          </Link>
          <Link
            href="/hospitals"
            className="flex-1 rounded-full border-2 border-[#00C6B2] py-3 text-center text-sm font-bold text-[#00C6B2]"
          >
            Go to Hospital Packs
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] py-3 text-center text-sm font-bold text-white"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function MockInterviewDebriefPage() {
  return (
    <Suspense
      fallback={
        <motion.div className="flex min-h-[60vh] items-center justify-center bg-[#F8F7FF]">
          <p className="text-[#7C5CBF]">Loading debrief...</p>
        </motion.div>
      }
    >
      <DebriefContent />
    </Suspense>
  );
}
