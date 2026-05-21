'use client';

import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

const AI_Q1 =
  'Tell me about a time you had multiple patients with competing needs. How did you prioritize?';
const AI_PUSH =
  "That's too vague. Give me a specific example with an actual patient situation and the outcome.";
const USER_REPLY =
  'I just assessed who needed help most and stayed calm...';

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    setShown('');
    setTyping(true);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setTyping(false);
        onDone?.();
      }
    }, 28);
    return () => clearInterval(id);
  }, [text, onDone]);

  return (
    <>
      {typing && shown.length === 0 && (
        <span className="inline-flex gap-1">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300"
              style={{ animationDelay: `${d * 0.15}s` }}
            />
          ))}
        </span>
      )}
      <span>{shown}</span>
    </>
  );
}

export function HeroDemoCard({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const [phase, setPhase] = useState(0);
  const [score, setScore] = useState(35);
  const rotateX = useSpring(useTransform(mouseY, [0, 800], [8, -8]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1200], [-8, 8]), {
    stiffness: 120,
    damping: 20,
  });

  const advance = useCallback(() => {
    setPhase((p) => (p + 1) % 5);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (phase === 0) timers.push(setTimeout(advance, 4000));
    if (phase === 1) timers.push(setTimeout(advance, 2500));
    if (phase === 2) timers.push(setTimeout(advance, 1500));
    if (phase === 3) {
      setScore(20);
      timers.push(setTimeout(advance, 3500));
    }
    if (phase === 4) {
      setScore(35);
      timers.push(setTimeout(() => setPhase(0), 2000));
    }
    return () => timers.forEach(clearTimeout);
  }, [phase, advance]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="relative w-full max-w-lg will-change-transform"
    >
      <div
        className="absolute inset-0 -z-10 rounded-3xl bg-purple-500/20 blur-3xl"
        aria-hidden
      />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-2xl">
        <div className="overflow-hidden rounded-[22px] bg-[#080018]">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            </div>
            <span className="flex-1 text-center text-xs text-white/60">
              Mock Interview • Neutral Mode 🧑‍💼
            </span>
            <span className="flex items-center gap-1 text-[10px] text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              LIVE
            </span>
          </div>

          <div className="min-h-[280px] space-y-3 p-4">
            {phase >= 0 && (
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-purple-500/25 bg-purple-500/15 px-3 py-2.5">
                <p className="mb-1 text-[10px] font-semibold text-purple-300">
                  AI Interviewer
                </p>
                <p className="text-sm leading-relaxed text-white/85">
                  {phase === 0 ? (
                    <Typewriter text={AI_Q1} onDone={advance} />
                  ) : (
                    AI_Q1
                  )}
                </p>
              </div>
            )}

            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm border border-white/10 bg-white/10 px-3 py-2.5"
              >
                <p className="text-sm text-white/80">{USER_REPLY}</p>
              </motion.div>
            )}

            {phase >= 3 && (
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-purple-500/25 bg-purple-500/15 px-3 py-2.5">
                <p className="text-sm leading-relaxed text-white/85">
                  {phase === 3 ? (
                    <Typewriter text={AI_PUSH} onDone={advance} />
                  ) : (
                    AI_PUSH
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-2 flex justify-between text-xs text-white/50">
              <span>Answer Quality</span>
              <span className={score < 30 ? 'text-red-400' : 'text-amber-400'}>
                {score}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="mt-2 text-xs text-white/45">
              💡 Tip: Use the STAR format — Situation, Task, Action, Result
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
