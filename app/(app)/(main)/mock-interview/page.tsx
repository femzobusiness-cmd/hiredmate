'use client';

import {
  INTERVIEW_HOSPITAL_OPTIONS,
  INTERVIEW_SPECIALTIES,
  PERSONALITY_MODES,
  QUESTION_COUNT_OPTIONS,
  type PersonalityMode,
} from '@/lib/mock-interview';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const EXPECT_ITEMS = [
  {
    emoji: '🎯',
    title: 'Real back-and-forth',
    description: 'AI asks follow-ups and challenges weak answers',
  },
  {
    emoji: '🧠',
    title: 'Adapts to you',
    description: 'Gets harder or easier based on your responses',
  },
  {
    emoji: '📊',
    title: 'Full debrief',
    description: 'Score, best answers, weakest answers, and improvements',
  },
];

export default function MockInterviewSetupPage() {
  const router = useRouter();
  const [personality, setPersonality] = useState<PersonalityMode>('neutral');
  const [specialty, setSpecialty] = useState<string>(INTERVIEW_SPECIALTIES[0]);
  const [hospital, setHospital] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const startInterview = () => {
    const params = new URLSearchParams({
      personality,
      specialty,
      questions: String(questionCount),
    });
    if (hospital) params.set('hospital', hospital);
    router.push(`/mock-interview/session?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C5CBF]">
            AI Mock Interviewer
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#1a1a2e] md:text-4xl">
            Your Interview Starts Now 🎙️
          </h1>
          <p className="mt-3 text-gray-600">
            An AI hiring manager will interview you in real-time, push back on weak
            answers, and give you a full debrief when you&apos;re done.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <p className="mb-4 text-sm font-semibold text-[#1a1a2e]">
            Choose your interviewer&apos;s personality
          </p>
          <motion.div className="grid gap-4 sm:grid-cols-3">
            {PERSONALITY_MODES.map((mode) => {
              const selected = personality === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setPersonality(mode.id)}
                  className={cn(
                    'rounded-[20px] bg-white p-5 text-left shadow-[0_8px_30px_rgba(124,92,191,0.1)] transition-all',
                    selected
                      ? 'border-2 shadow-[0_12px_40px_rgba(124,92,191,0.2)]'
                      : 'border-2 border-transparent hover:border-[#7C5CBF]/20'
                  )}
                  style={
                    selected
                      ? { borderColor: mode.color, boxShadow: `0 12px 40px ${mode.color}33` }
                      : undefined
                  }
                >
                  <span className="text-3xl">{mode.emoji}</span>
                  <p className="mt-2 font-bold text-[#1a1a2e]">{mode.name}</p>
                  <p className="mt-1 text-xs text-gray-600">{mode.description}</p>
                </button>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <label className="mb-2 block text-sm font-semibold text-[#1a1a2e]">
            What specialty are you interviewing for? (optional)
          </label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full rounded-[12px] border border-[#7C5CBF]/20 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#7C5CBF]"
          >
            {INTERVIEW_SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <label className="mb-2 block text-sm font-semibold text-[#1a1a2e]">
            Practicing for a specific hospital? (optional)
          </label>
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            className="w-full rounded-[12px] border border-[#7C5CBF]/20 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#7C5CBF]"
          >
            {INTERVIEW_HOSPITAL_OPTIONS.map((h) => (
              <option key={h.label} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <p className="mb-3 text-sm font-semibold text-[#1a1a2e]">
            How many questions?
          </p>
          <div className="flex gap-3">
            {QUESTION_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={cn(
                  'rounded-full px-6 py-2.5 text-sm font-bold transition-all',
                  questionCount === count
                    ? 'bg-[#7C5CBF] text-white shadow-md'
                    : 'bg-white text-[#7C5CBF] shadow-sm hover:bg-[#7C5CBF]/10'
                )}
              >
                {count}
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <p className="mb-4 text-sm font-semibold text-[#1a1a2e]">What to expect</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {EXPECT_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(124,92,191,0.08)]"
              >
                <span className="text-2xl">{item.emoji}</span>
                <p className="mt-2 text-sm font-bold text-[#1a1a2e]">{item.title}</p>
                <p className="mt-1 text-xs text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <button
            type="button"
            disabled={!personality}
            onClick={startInterview}
            className="w-full rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] py-4 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-40"
          >
            Start Interview →
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
