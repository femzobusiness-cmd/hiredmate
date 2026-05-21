'use client';

import { motion } from 'framer-motion';

export function MockInterviewMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-full max-w-lg"
    >
      <div
        className="absolute inset-0 -z-10 rounded-3xl bg-purple-500/20 blur-3xl"
        aria-hidden
      />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
        <div className="overflow-hidden rounded-2xl bg-[#0D0221]">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            <span className="ml-2 text-xs font-medium text-white/70">
              Mock Interview — Neutral Mode 🧑‍💼
            </span>
          </div>

          <div className="space-y-4 p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-purple-500/20 bg-purple-500/20 px-4 py-3">
              <p className="text-xs font-semibold text-purple-200">
                Dr. Sarah Chen
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">
                Tell me about a time you advocated for a patient when the care
                team disagreed. Be specific — what did you do?
              </p>
            </div>

            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-sm leading-relaxed text-white/90">
                I noticed rising lactate on my ICU patient and escalated to the
                attending before the scheduled round...
              </p>
            </div>

            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-purple-500/20 bg-purple-500/20 px-4 py-3">
              <p className="text-sm leading-relaxed text-white/80">
                That&apos;s a start — what was the outcome? How did you measure
                whether your advocacy changed the plan of care?
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <span className="flex-1 text-sm text-white/40">
                Type your answer...
              </span>
              <span className="rounded-lg bg-[#7C5CBF] px-3 py-1 text-xs font-bold text-white">
                Send
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
