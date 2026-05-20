'use client';

import {
  BATTLE_TIMER_SECONDS,
  calculateBattlePoints,
  calculateBattleXp,
  type BattleQuestion,
} from '@/lib/battle';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type GamePhase =
  | 'loading'
  | 'countdown'
  | 'playing'
  | 'answer-reveal'
  | 'game-over';

const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'];

export function BattleSessionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'rapid-response';
  const specialty = searchParams.get('specialty') || 'General';

  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BATTLE_TIMER_SECONDS);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showInterruption, setShowInterruption] = useState(false);
  const [interruptionShown, setInterruptionShown] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [speedBonuses, setSpeedBonuses] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [countdownStep, setCountdownStep] = useState(0);
  const [speedToast, setSpeedToast] = useState(false);
  const [difficultyFlash, setDifficultyFlash] = useState<number | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState(false);
  const [savedXp, setSavedXp] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<'lives' | 'complete'>('lives');

  const questionStartRef = useRef(Date.now());
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  const loadQuestions = useCallback(async () => {
    setGamePhase('loading');
    const res = await fetch('/api/battle/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, specialty, difficulty: 1, count: 20 }),
    });
    const data = await res.json();
    setQuestions(data.questions || []);
    setCountdownStep(0);
    setGamePhase('countdown');
  }, [mode, specialty]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (gamePhase !== 'countdown') return;
    if (countdownStep >= COUNTDOWN_STEPS.length) {
      setGamePhase('playing');
      questionStartRef.current = Date.now();
      setTimeLeft(BATTLE_TIMER_SECONDS);
      return;
    }
    const timer = setTimeout(() => {
      setCountdownStep((s) => s + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [gamePhase, countdownStep]);

  useEffect(() => {
    if (gamePhase !== 'playing' || selectedAnswer) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        const next = Math.max(0, t - 0.1);
        if (
          currentQuestion?.hasInterruption &&
          !interruptionShown &&
          next <= 10 &&
          t > 10
        ) {
          setShowInterruption(true);
          setInterruptionShown(true);
          setTimeout(() => setShowInterruption(false), 3000);
        }
        if (next <= 0) {
          clearInterval(interval);
          handleTimeout();
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, currentIndex, selectedAnswer, interruptionShown, currentQuestion]);

  useEffect(() => {
    if (gamePhase !== 'game-over') return;
    let frame: number;
    const start = performance.now();
    const duration = 1500;
    const from = 0;
    const to = score;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplayScore(Math.round(from + (to - from) * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [gamePhase, score]);

  const endGame = useCallback(
    async (reason: 'lives' | 'complete') => {
      setGameOverReason(reason);
      setGamePhase('game-over');

      if (savedRef.current) return;
      savedRef.current = true;

      const xp = calculateBattleXp(score, speedBonuses, maxStreak);
      setSavedXp(xp);

      try {
        const res = await fetch('/api/battle/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score,
            questionsAnswered: currentIndex + (selectedAnswer ? 1 : 0),
            correctAnswers,
            speedBonuses,
            maxStreak,
            difficultyReached: difficulty,
          }),
        });
        const data = await res.json();
        if (data.isPersonalBest) {
          setIsPersonalBest(true);
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      } catch (e) {
        console.error(e);
      }
    },
    [
      score,
      speedBonuses,
      maxStreak,
      currentIndex,
      selectedAnswer,
      correctAnswers,
      difficulty,
    ]
  );

  const advanceQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      endGame('complete');
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setTimeLeft(BATTLE_TIMER_SECONDS);
    setInterruptionShown(false);
    setShowInterruption(false);
    questionStartRef.current = Date.now();
    setGamePhase('playing');
  }, [currentIndex, questions.length, endGame]);

  const revealAndAdvance = useCallback(
    (correct: boolean, remainingLives: number) => {
      setGamePhase('answer-reveal');
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      revealTimerRef.current = setTimeout(() => {
        if (remainingLives <= 0) {
          endGame('lives');
        } else if (currentIndex + 1 >= questions.length) {
          endGame('complete');
        } else {
          advanceQuestion();
        }
      }, 1500);
    },
    [currentIndex, questions.length, advanceQuestion, endGame]
  );

  const handleTimeout = useCallback(() => {
    if (selectedAnswer || gamePhase !== 'playing') return;
    setSelectedAnswer('TIMEOUT');
    setStreak(0);
    const nextLives = lives - 1;
    setLives(Math.max(0, nextLives));
    revealAndAdvance(false, nextLives);
  }, [selectedAnswer, gamePhase, lives, revealAndAdvance]);

  const handleAnswer = (letter: string) => {
    if (selectedAnswer || gamePhase !== 'playing' || !currentQuestion) return;

    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    const correct =
      letter.toUpperCase() === currentQuestion.correctAnswer.toUpperCase();

    setSelectedAnswer(letter);

    if (correct) {
      const nextStreak = streak + 1;
      const { points, speedBonus } = calculateBattlePoints(
        true,
        elapsed,
        nextStreak,
        difficulty
      );
      setScore((s) => s + points);
      setStreak(nextStreak);
      setMaxStreak((m) => Math.max(m, nextStreak));
      setCorrectAnswers((c) => c + 1);

      if (speedBonus) {
        setSpeedBonuses((b) => b + 1);
        setSpeedToast(true);
        setTimeout(() => setSpeedToast(false), 1200);
      }

      const newCorrectTotal = correctAnswers + 1;
      if (newCorrectTotal > 0 && newCorrectTotal % 3 === 0 && difficulty < 5) {
        const nextDiff = difficulty + 1;
        setDifficulty(nextDiff);
        setDifficultyFlash(nextDiff);
        setTimeout(() => setDifficultyFlash(null), 600);
      }

      revealAndAdvance(true, lives);
    } else {
      setStreak(0);
      const nextLives = lives - 1;
      setLives(Math.max(0, nextLives));
      revealAndAdvance(false, nextLives);
    }
  };

  const timerPercent = (timeLeft / BATTLE_TIMER_SECONDS) * 100;
  const timerColor =
    timerPercent > 50 ? '#22C55E' : timerPercent > 25 ? '#EAB308' : '#EF4444';

  if (gamePhase === 'loading') {
    return (
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-[#1A0533] to-[#2D1B69] text-white">
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          Loading battle scenarios...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-gradient-to-b from-[#1A0533] to-[#2D1B69] text-white">
      <AnimatePresence>
        {gamePhase === 'countdown' && (
          <motion.div
            key={countdownStep}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-gradient-to-b from-[#1A0533] to-[#2D1B69]"
          >
            <span className="text-8xl font-black text-[#EF4444]">
              {COUNTDOWN_STEPS[countdownStep]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {difficultyFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] flex items-center justify-center bg-red-600/90"
          >
            <p className="text-4xl font-black">DIFFICULTY UP! LVL {difficultyFlash}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInterruption && currentQuestion?.interruption && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed left-0 right-0 top-0 z-[104] flex items-center gap-3 bg-[#EF4444] px-4 py-3 shadow-lg"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{currentQuestion.interruption}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {speedToast && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: -40 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/3 z-[103] -translate-x-1/2 text-2xl font-black text-[#F59E0B]"
          >
            +SPEED BONUS ⚡
          </motion.p>
        )}
      </AnimatePresence>

      {gamePhase !== 'game-over' && gamePhase !== 'countdown' && (
        <>
          <div className="fixed left-0 right-0 top-0 z-[102] border-b border-white/10 bg-[#1A0533]/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <motion.div className="flex gap-1 text-lg">
                {[0, 1, 2].map((i) => (
                  <span key={i}>{i < lives ? '❤️' : '🖤'}</span>
                ))}
              </motion.div>
              <motion.div className="flex items-center gap-1 font-black text-[#F59E0B]">
                <Zap className="h-5 w-5" />
                {score.toLocaleString()}
              </motion.div>
              <motion.div className="flex items-center gap-2 text-sm">
                {streak >= 2 && (
                  <span className="font-bold text-orange-400">🔥 {streak}</span>
                )}
                <span className="rounded-pill bg-white/10 px-2 py-0.5 font-bold">
                  LVL {difficulty}
                </span>
              </motion.div>
            </div>
          </div>

          <div className="fixed left-0 right-0 top-[52px] z-[101] h-2 bg-black/40">
            <div
              className={cn(
                'h-full transition-[width] duration-100 ease-linear',
                timerPercent <= 25 && 'animate-pulse'
              )}
              style={{
                width: `${timerPercent}%`,
                backgroundColor: timerColor,
              }}
            />
          </div>

          <div className="mx-auto max-w-2xl px-4 pb-12 pt-20">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[20px] border border-white/10 bg-white/5 p-6"
              >
                <span className="rounded-pill bg-[#EF4444]/30 px-3 py-1 text-xs font-bold text-red-200">
                  {currentQuestion.category}
                </span>
                <p className="mt-4 text-base leading-relaxed text-white/90">
                  {currentQuestion.scenario}
                </p>
                <p className="mt-4 text-lg font-bold">{currentQuestion.question}</p>
              </motion.div>
            )}

            <div className="mt-6 space-y-3">
              {currentQuestion?.options.map((opt) => {
                const letter = opt.charAt(0).toUpperCase();
                const isSelected = selectedAnswer === letter;
                const isCorrect =
                  letter === currentQuestion.correctAnswer.toUpperCase();
                const reveal = gamePhase === 'answer-reveal';

                return (
                  <motion.button
                    key={opt}
                    type="button"
                    disabled={!!selectedAnswer}
                    whileHover={!selectedAnswer ? { scale: 1.01 } : {}}
                    onClick={() => handleAnswer(letter)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition',
                      'border-white/10 bg-white/5',
                      !selectedAnswer && 'hover:bg-white/10',
                      reveal && isCorrect && 'border-green-400 bg-green-500/20',
                      reveal &&
                        isSelected &&
                        !isCorrect &&
                        'border-red-400 bg-red-500/20',
                      reveal &&
                        isSelected &&
                        isCorrect &&
                        'border-green-400 bg-green-500/20'
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/30 text-sm font-bold">
                      {letter}
                    </span>
                    <span className="flex-1 pt-0.5 text-sm">{opt.slice(3).trim()}</span>
                    {reveal && isCorrect && <span className="text-green-400">✓</span>}
                    {reveal && isSelected && !isCorrect && (
                      <span className="text-red-400">✗</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {gamePhase === 'answer-reveal' && currentQuestion && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-sm text-white/60"
              >
                {currentQuestion.explanation}
              </motion.p>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {gamePhase === 'game-over' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-gradient-to-b from-[#1A0533] to-[#2D1B69] p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg text-center"
            >
              <p className="text-6xl">
                {gameOverReason === 'complete' ? '🏆' : '💀'}
              </p>
              <h2 className="mt-4 text-5xl font-black">BATTLE OVER</h2>
              <p className="mt-4 text-6xl font-black text-[#F59E0B]">
                {displayScore.toLocaleString()}
              </p>

              {isPersonalBest && (
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="mt-4 rounded-pill bg-[#F59E0B]/20 px-4 py-2 font-bold text-[#F59E0B]"
                >
                  NEW PERSONAL BEST! 🎉
                </motion.p>
              )}

              <div className="mt-8 grid grid-cols-2 gap-3 text-left text-sm">
                {[
                  { label: 'Questions answered', value: currentIndex + 1 },
                  {
                    label: 'Correct',
                    value: `${correctAnswers} (${questions.length ? Math.round((correctAnswers / (currentIndex + 1)) * 100) : 0}%)`,
                  },
                  { label: 'Max streak', value: `🔥 ${maxStreak}` },
                  { label: 'Speed bonuses', value: `⚡ ${speedBonuses}` },
                  { label: 'Highest difficulty', value: difficulty },
                  { label: 'XP earned', value: savedXp },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-white/50">{stat.label}</p>
                    <p className="font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    savedRef.current = false;
                    setCurrentIndex(0);
                    setTimeLeft(BATTLE_TIMER_SECONDS);
                    setScore(0);
                    setDisplayScore(0);
                    setLives(3);
                    setStreak(0);
                    setMaxStreak(0);
                    setSelectedAnswer(null);
                    setShowInterruption(false);
                    setInterruptionShown(false);
                    setDifficulty(1);
                    setSpeedBonuses(0);
                    setCorrectAnswers(0);
                    setCountdownStep(0);
                    setIsPersonalBest(false);
                    setSavedXp(0);
                    loadQuestions();
                  }}
                  className="rounded-pill bg-gradient-to-r from-[#EF4444] to-[#DC2626] px-8 py-3 font-bold"
                >
                  Battle Again ⚡
                </button>
                <Link
                  href="/battle/leaderboard"
                  className="rounded-pill border border-white/30 px-8 py-3 font-bold text-center"
                >
                  View Leaderboard
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
