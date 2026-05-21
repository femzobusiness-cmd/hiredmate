'use client';

import { motion } from 'framer-motion';
import { Building2, FileText, Mic, Trophy, Volume2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

function Waveform() {
  return (
    <div className="flex h-16 items-end justify-center gap-1">
      {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8].map((h, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-[#00C6B2]"
          animate={{ height: [12, 12 + h * 40, 12] }}
          transition={{
            duration: 0.6 + i * 0.08,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </div>
  );
}

function BattleTimer() {
  const [sec, setSec] = useState(28);
  useEffect(() => {
    const id = setInterval(() => {
      setSec((s) => (s <= 0 ? 28 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-red-500/50"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="font-mono text-3xl font-black text-red-400">
        0:{String(sec).padStart(2, '0')}
      </span>
    </div>
  );
}

function AtsRing() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPct(87), 400);
    return () => clearTimeout(t);
  }, []);
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex">
    <svg width="96" height="96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#22c55e"
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
      {pct}%
    </span>
    </div>
  );
}

const cardAnim = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export function BentoFeatures() {
  const [hoverMock, setHoverMock] = useState(false);
  const [typing, setTyping] = useState('');

  useEffect(() => {
    if (!hoverMock) {
      setTyping('');
      return;
    }
    const msg = 'Give me a STAR example...';
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyping(msg.slice(0, i));
      if (i >= msg.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [hoverMock]);

  return (
    <section id="features" className="relative py-28">
      <div className="immersive-grid absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          {...cardAnim}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-xs font-bold text-purple-300">
            ✦ FEATURES
          </span>
          <h2
            className="mt-4 text-4xl font-black text-white sm:text-5xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Everything you need to get hired
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/50">
            Mock interviews, voice analysis, hospital packs, and battle mode — all in one place.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-auto">
          <motion.article
            {...cardAnim}
            transition={{ delay: 0 }}
            onMouseEnter={() => setHoverMock(true)}
            onMouseLeave={() => setHoverMock(false)}
            className="group col-span-1 rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(124,92,191,0.2)] md:col-span-7 md:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CBF] to-[#6D28D9] shadow-[0_0_24px_rgba(124,92,191,0.4)]">
                  <Mic className="h-7 w-7 text-white" />
                </div>
                <span className="mt-4 inline-block rounded-full bg-[#F59E0B]/20 px-2 py-0.5 text-xs font-bold text-[#F59E0B]">
                  Most Popular
                </span>
                <h3 className="mt-2 text-xl font-bold text-white">AI Mock Interviewer</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Dr. Sarah Chen, Mr. James Mitchell, or Director Karen Walsh. Friendly, Neutral, or Tough — pushes back until your answer is actually good.
                </p>
              </div>
              <div className="flex-1 rounded-2xl border border-white/8 bg-[#080018] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/40" />
                  <span className="text-xs text-white/50">AI Interviewer</span>
                </div>
                <p className="min-h-[40px] text-sm text-white/75" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {typing || (hoverMock ? '' : 'Waiting for your answer...')}
                  {hoverMock && typing.length > 0 && (
                    <span className="animate-pulse">|</span>
                  )}
                </p>
              </div>
            </div>
          </motion.article>

          <motion.article
            {...cardAnim}
            transition={{ delay: 0.1 }}
            className="col-span-1 rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_0_40px_rgba(0,198,178,0.15)] md:col-span-5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00C6B2] to-teal-600">
              <Volume2 className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">🔊 Voice Practice</h3>
            <p className="mt-2 text-sm text-white/55">
              Filler word counts, WPM pace, and clinical accuracy — highlighted in your transcript.
            </p>
            <Waveform />
          </motion.article>

          <motion.article
            {...cardAnim}
            transition={{ delay: 0.15 }}
            className="col-span-1 rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] md:col-span-5"
          >
            <Building2 className="h-7 w-7 text-blue-400" />
            <h3 className="mt-4 text-lg font-bold text-white">🏥 Hospital Prep Packs</h3>
            <p className="mt-2 text-sm text-white/55">Mayo, Cleveland, Northwestern, HCA, Kaiser.</p>
            <div className="mt-4 flex -space-x-2">
              {['🏥', '💙', '🟣', '❤️', '💚'].map((e, i) => (
                <div
                  key={e}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:-translate-y-1"
                  style={{ zIndex: 5 - i }}
                >
                  {e}
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            {...cardAnim}
            transition={{ delay: 0.2 }}
            className="col-span-1 rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(239,68,68,0.2)] md:col-span-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <Zap className="h-7 w-7 text-red-400" />
                <h3 className="mt-4 text-xl font-bold text-white">⚡ Battle Mode</h3>
                <p className="mt-2 text-sm text-white/55">
                  30 seconds. Escalating difficulty. Can you survive?
                </p>
              </div>
              <BattleTimer />
            </div>
          </motion.article>

          <motion.article
            {...cardAnim}
            transition={{ delay: 0.25 }}
            className="col-span-1 rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] md:col-span-6"
          >
            <FileText className="h-7 w-7 text-green-400" />
            <h3 className="mt-4 text-lg font-bold text-white">📄 Resume Builder</h3>
            <p className="mt-2 text-sm text-white/55">ATS-optimized with built-in score.</p>
            <div className="mt-4 flex justify-center">
              <AtsRing />
            </div>
          </motion.article>

          <motion.article
            {...cardAnim}
            transition={{ delay: 0.3 }}
            className="col-span-1 rounded-3xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] md:col-span-6"
          >
            <Trophy className="h-7 w-7 text-[#F59E0B]" />
            <h3 className="mt-4 text-lg font-bold text-white">🏆 Community</h3>
            <div className="mt-4 space-y-2">
              {[
                { name: 'Jessica T.', xp: 4200 },
                { name: 'Marcus D.', xp: 3850 },
                { name: 'Priya K.', xp: 3620 },
              ].map((u, i) => (
                <div key={u.name} className="flex items-center gap-2 text-sm">
                  <div className="h-7 w-7 rounded-full bg-purple-500/30 text-center text-xs leading-7 text-white">
                    {u.name[0]}
                  </div>
                  <span className="flex-1 text-white/70">{u.name}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#F59E0B]"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
