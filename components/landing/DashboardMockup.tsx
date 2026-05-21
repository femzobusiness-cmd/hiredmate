'use client';

import { motion } from 'framer-motion';

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="mx-auto mt-14 max-w-4xl rotate-1 rounded-2xl bg-gradient-to-br from-[#7C5CBF] to-[#4C3A8F] p-1 shadow-2xl"
    >
      <div className="overflow-hidden rounded-[14px] bg-[#F8F7FF] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#7C5CBF]/20" />
            <div className="space-y-1">
              <div className="h-2.5 w-24 rounded-full bg-gray-200" />
              <div className="h-2 w-16 rounded-full bg-gray-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-pill bg-[#F59E0B]/20" />
            <div className="h-8 w-8 rounded-full bg-[#7C5CBF]/15" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Readiness', color: 'from-[#7C5CBF] to-[#9B7FD4]' },
            { label: 'Streak', color: 'from-[#F59E0B] to-[#FBBF24]' },
            { label: 'XP', color: 'from-[#00C6B2] to-[#2DD4BF]' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[16px] bg-white p-4 shadow-[0_4px_20px_rgba(124,92,191,0.1)]"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {card.label}
              </p>
              <div
                className={`mt-3 h-10 rounded-lg bg-gradient-to-r ${card.color} opacity-80`}
              />
              <div className="mt-2 h-2 w-3/4 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[16px] bg-white p-4 shadow-[0_4px_20px_rgba(124,92,191,0.08)]">
            <p className="text-xs font-bold text-[#7C5CBF]">Mock Interview</p>
            <div className="mt-3 space-y-2">
              <div className="h-2 w-full rounded-full bg-gray-100" />
              <div className="h-2 w-5/6 rounded-full bg-gray-100" />
              <div className="h-8 w-28 rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8]" />
            </div>
          </div>
          <div className="rounded-[16px] bg-gradient-to-br from-[#1A0533] to-[#2D1B69] p-4 text-white">
            <p className="text-xs font-bold text-[#F59E0B]">⚡ Battle Mode</p>
            <div className="mt-3 flex gap-1">
              {['❤️', '❤️', '🖤'].map((h, i) => (
                <span key={i} className="text-sm">
                  {h}
                </span>
              ))}
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div className="h-full w-2/3 rounded-full bg-green-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
