'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function SpeakingWaveform() {
  return (
    <div className="flex h-20 items-center justify-center gap-1">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-[#00C6B2]"
          animate={{ height: [8, 24 + (i % 4) * 8, 8] }}
          transition={{
            duration: 0.5 + (i % 5) * 0.1,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </div>
  );
}

export function VoicePracticeSection() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 3), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-24" style={{ background: 'linear-gradient(180deg, #04000F 0%, rgba(0,198,178,0.06) 50%, #04000F 100%)' }}>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-block rounded-full border border-teal-500/30 bg-teal-500/20 px-4 py-2 text-xs font-bold text-[#00C6B2]"
        >
          VOICE PRACTICE
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 text-4xl font-black text-white sm:text-5xl"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Hear yourself improve
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="immersive-glass immersive-glow mt-12 p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-teal-400/30 bg-teal-500/10 shadow-[0_0_40px_rgba(0,198,178,0.3)]"
          >
            <span className="text-3xl">🎙️</span>
          </motion.div>
          <SpeakingWaveform />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs text-white/40">Filler Words</p>
              <p className="text-2xl font-black text-green-400">2</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs text-white/40">Speaking Pace</p>
              <p className="text-2xl font-black text-white">138 WPM</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[70%] rounded-full bg-[#00C6B2]" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs text-white/40">Confidence</p>
              <p className="text-2xl font-black text-white">84%</p>
            </div>
          </div>

          <motion.p
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-left text-sm leading-relaxed text-white/70"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            During my last shift I was{' '}
            <span className="rounded bg-amber-500/30 px-1 text-amber-300">um</span>{' '}
            caring for 6 patients when a rapid response was called on my assignment...
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
