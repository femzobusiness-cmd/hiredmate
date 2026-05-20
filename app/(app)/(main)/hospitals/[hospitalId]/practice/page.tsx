'use client';

import { getHospitalById } from '@/lib/hospitals-data';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type HospitalQuestion = {
  id: string;
  question: string;
  category: string;
  tips: string[];
};

type Stage =
  | 'loading-questions'
  | 'question'
  | 'submitting'
  | 'result'
  | 'complete';

type ScoreResult = {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback?: string;
  sample_answer?: string;
};

function starRating(score: number): 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  return 1;
}

function xpForStars(stars: 1 | 2 | 3): number {
  if (stars === 3) return 40;
  if (stars === 2) return 25;
  return 15;
}

export default function HospitalPracticePage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.hospitalId as string;
  const hospital = getHospitalById(hospitalId);

  const [stage, setStage] = useState<Stage>('loading-questions');
  const [questions, setQuestions] = useState<HospitalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [scores, setScores] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState<ScoreResult | null>(null);
  const [totalXP, setTotalXP] = useState(0);

  const gradient = hospital
    ? `linear-gradient(135deg, ${hospital.gradientFrom}, ${hospital.gradientTo})`
    : 'linear-gradient(135deg, #7C5CBF, #9B7FD4)';

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const generateQuestions = useCallback(async () => {
    if (!hospital) return;

    setStage('loading-questions');
    setCurrentIndex(0);
    setAnswer('');
    setScores([]);
    setCurrentScore(null);
    setTotalXP(0);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hospital',
          hospital_id: hospital.id,
          hospital_name: hospital.name,
          hospital_context: hospital.promptContext,
          questions_count: 5,
        }),
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setStage('question');
        return;
      }
    } catch {
      /* use fallback */
    }

    const fallback = hospital.knownQuestionPatterns.map((q, i) => ({
      id: `fallback-${i}`,
      question: q,
      category: 'Behavioral',
      tips: hospital.insiderTips.slice(0, 2),
    }));
    setQuestions(fallback.slice(0, 5));
    setStage('question');
  }, [hospital]);

  useEffect(() => {
    if (!hospital) {
      router.replace('/hospitals');
      return;
    }
    generateQuestions();
  }, [hospital, router, generateQuestions]);

  const submitAnswer = async () => {
    if (!hospital || !currentQuestion || answer.trim().length < 20) return;

    setStage('submitting');

    try {
      const res = await fetch('/api/score-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer,
          hospital_name: hospital.name,
          hospital_context: hospital.promptContext,
          mode: 'hospital',
        }),
      });

      const data = await res.json();
      if (res.ok && typeof data.score === 'number') {
        setCurrentScore({
          score: data.score,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          feedback: data.feedback || data.sample_answer,
          sample_answer: data.sample_answer,
        });
        setStage('result');
        return;
      }
    } catch {
      /* fallback */
    }

    setCurrentScore({
      score: 72,
      strengths: ['You addressed the scenario with a clear structure'],
      improvements: ['Add more specific clinical details and outcomes'],
      feedback:
        'Good foundation — strengthen with STAR format and hospital-specific values.',
    });
    setStage('result');
  };

  const nextQuestion = () => {
    if (!currentScore) return;

    const stars = starRating(currentScore.score);
    const xp = xpForStars(stars);
    setTotalXP((prev) => prev + xp);
    setScores((prev) => [...prev, currentScore.score]);
    setAnswer('');
    setCurrentScore(null);

    if (currentIndex + 1 >= questions.length) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setStage('complete');
      return;
    }

    setCurrentIndex((i) => i + 1);
    setStage('question');
  };

  const stars: 1 | 2 | 3 = currentScore
    ? starRating(currentScore.score)
    : 1;

  if (!hospital) {
    return null;
  }

  return (
    <motion.div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <AnimatePresence mode="wait">
        {stage === 'loading-questions' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[60vh] flex-col items-center justify-center"
          >
            <motion.div
              className="rounded-[20px] bg-white p-10 text-center shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              <motion.span
                className="text-5xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {hospital.emoji}
              </motion.span>
              <p className="mt-4 text-lg font-bold text-[#1a1a2e]">
                Activating {hospital.badgeText}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Generating questions in {hospital.name}&apos;s interview style...
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#7C5CBF]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {stage === 'question' && currentQuestion && (
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push(`/hospitals/${hospital.id}`)}
                className="text-sm font-medium text-[#7C5CBF]"
              >
                ← Exit
              </button>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: gradient }}
              >
                {hospital.badgeText}
              </span>
              <span className="text-sm font-bold text-gray-600">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#F8F7FF]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: gradient }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <motion.div className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]">
              <span className="rounded-full bg-[#7C5CBF]/10 px-3 py-1 text-xs font-bold text-[#7C5CBF]">
                {currentQuestion.category}
              </span>
              <p className="mt-4 text-lg font-semibold leading-relaxed text-[#1a1a2e]">
                {currentQuestion.question}
              </p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here (STAR format recommended)..."
                className="mt-4 h-48 w-full resize-none rounded-[12px] border border-[#7C5CBF]/20 bg-[#F8F7FF] p-4 text-sm outline-none focus:ring-2 focus:ring-[#7C5CBF]"
              />
              <motion.div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {answer.length} characters
                </span>
                <button
                  type="button"
                  disabled={answer.trim().length < 20}
                  onClick={submitAnswer}
                  className="rounded-full px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: gradient }}
                >
                  Submit Answer →
                </button>
              </motion.div>
            </motion.div>

            {currentQuestion.tips.length > 0 && (
              <motion.div className="mt-4 rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(124,92,191,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tips
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {currentQuestion.tips.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === 'submitting' && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[40vh] items-center justify-center"
          >
            <p className="text-[#7C5CBF] font-medium">Scoring your answer...</p>
          </motion.div>
        )}

        {stage === 'result' && currentScore && (
          <motion.div
            key={`result-${currentIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <motion.div className="rounded-[20px] bg-white p-8 text-center shadow-[0_8px_30px_rgba(124,92,191,0.12)]">
              <div className="text-2xl">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i}>{i < stars ? '⭐' : '☆'}</span>
                ))}
              </div>
              <p
                className="mt-4 text-5xl font-black"
                style={{ color: hospital.gradientFrom }}
              >
                {currentScore.score}
              </p>
              <p className="mt-3 text-sm text-gray-600">
                {currentScore.feedback ||
                  currentScore.sample_answer ||
                  'Keep refining your STAR responses.'}
              </p>
              <span className="mt-4 inline-block rounded-full bg-[#F59E0B]/15 px-4 py-1.5 text-sm font-bold text-[#F59E0B]">
                +{xpForStars(stars)} XP earned
              </span>

              {currentScore.strengths.length > 0 && (
                <div className="mt-6 text-left">
                  <p className="text-sm font-bold text-green-700">What worked</p>
                  <ul className="mt-2 space-y-1">
                    {currentScore.strengths.map((s) => (
                      <li key={s} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-green-600">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentScore.improvements.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-bold text-amber-700">To improve</p>
                  <ul className="mt-2 space-y-1">
                    {currentScore.improvements.map((s) => (
                      <li key={s} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-amber-600">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={nextQuestion}
                className="mt-8 w-full rounded-full py-3 text-sm font-bold text-white"
                style={{ background: gradient }}
              >
                {currentIndex + 1 >= questions.length
                  ? '🎉 See Results'
                  : 'Next Question →'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[60vh] flex-col items-center justify-center"
          >
            <motion.div className="w-full max-w-md rounded-[20px] bg-white p-10 text-center shadow-[0_8px_30px_rgba(124,92,191,0.12)]">
              <p className="text-4xl">🎉</p>
              <h2 className="mt-4 text-2xl font-black text-[#1a1a2e]">
                {hospital.shortName} Prep Complete!
              </h2>
              <p className="mt-2 text-gray-600">
                {questions.length} questions answered
              </p>

              <div
                className="mt-6 rounded-[16px] p-4 text-white"
                style={{ background: gradient }}
              >
                <p className="text-xs uppercase tracking-wide opacity-80">
                  Average Score
                </p>
                <p className="text-3xl font-black">{averageScore}</p>
              </div>

              <div className="mt-4 rounded-[16px] bg-[#F59E0B]/15 p-4">
                <p className="text-xs font-semibold uppercase text-[#F59E0B]">
                  XP Earned
                </p>
                <p className="text-2xl font-black text-[#F59E0B]">+{totalXP} XP</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/hospitals/${hospital.id}`}
                  className="flex-1 rounded-full border-2 border-[#7C5CBF] py-3 text-center text-sm font-bold text-[#7C5CBF]"
                >
                  Back to Pack
                </Link>
                <button
                  type="button"
                  onClick={generateQuestions}
                  className="flex-1 rounded-full py-3 text-sm font-bold text-white"
                  style={{ background: gradient }}
                >
                  Practice Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
