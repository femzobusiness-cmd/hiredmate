'use client';

import { PERSONALITY_MODES } from '@/lib/mock-interview';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function MockInterviewWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-[#1a1a2e]">🎙️ AI Mock Interview</h3>
        <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold text-white">
          NEW
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Practice with a real-time AI hiring manager. Choose Friendly, Neutral, or
        Tough mode.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PERSONALITY_MODES.map((mode) => (
          <span
            key={mode.id}
            className="rounded-full bg-[#F8F7FF] px-3 py-1.5 text-xs font-medium text-[#7C5CBF]"
          >
            {mode.emoji} {mode.name}
          </span>
        ))}
      </div>
      <Link
        href="/mock-interview"
        className="mt-5 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
      >
        Start Mock Interview →
      </Link>
    </motion.div>
  );
}
