'use client';

import VoiceRecorder from '@/components/VoiceRecorder';
import {
  buildTranscriptSegments,
  confidenceStars,
  fillerCountColor,
  formatFillerList,
  scoreColor,
  type VoiceAnalysisResult,
  type VoiceSpecialtyKey,
  VOICE_SPECIALTY_OPTIONS,
} from '@/lib/voice-analysis';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

const ANALYZING_LINES = [
  'Counting filler words...',
  'Measuring your pace...',
  'Checking clinical accuracy...',
  'Calculating confidence score...',
];

type SessionStage = 'question' | 'recording' | 'results';

function ScoreCircle({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplay(score);
        clearInterval(interval);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score]);

  const offset = circumference - (display / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={140} height={140} className="-rotate-90">
        <circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke="#F8F7FF"
          strokeWidth={10}
        />
        <motion.circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <p
        className="absolute mt-[52px] text-4xl font-black"
        style={{ color }}
      >
        {display}
      </p>
      <p className="mt-4 text-sm font-semibold text-gray-600">Overall Score</p>
    </div>
  );
}

export function VoicePracticeClient() {
  const [specialtyKey, setSpecialtyKey] = useState<VoiceSpecialtyKey>('General');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Behavioral');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionStage, setSessionStage] = useState<SessionStage>('question');
  const [recorderKey, setRecorderKey] = useState(0);
  const [analyzingLine, setAnalyzingLine] = useState(0);

  const specialtyOption = VOICE_SPECIALTY_OPTIONS.find(
    (s) => s.key === specialtyKey
  )!;
  const specialty = specialtyOption.apiValue;

  const loadQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setAnalysisResult(null);
    setTranscript('');
    setSessionStage('question');

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'voice',
          specialty,
          questions_count: 1,
        }),
      });
      const data = await res.json();
      const q = data.questions?.[0];
      if (q?.question) {
        setCurrentQuestion(q.question);
        setQuestionCategory(q.category || 'Behavioral');
      } else {
        throw new Error('No question');
      }
    } catch {
      setCurrentQuestion(
        `Describe a challenging patient situation you handled in ${specialty} and what you learned.`
      );
      setQuestionCategory('Behavioral');
    } finally {
      setIsLoadingQuestion(false);
      setRecorderKey((k) => k + 1);
    }
  }, [specialty]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setAnalyzingLine((i) => (i + 1) % ANALYZING_LINES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const saveSession = async (
    result: VoiceAnalysisResult,
    text: string,
    duration: number
  ) => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('voice_sessions').insert({
      user_id: user.id,
      question: currentQuestion,
      transcript: text,
      duration_seconds: duration,
      word_count: result.wordCount,
      words_per_minute: result.wordsPerMinute,
      filler_word_count: result.fillerWordCount,
      filler_words_found: result.fillerWordsFound,
      overall_score: result.overallScore,
      pace_rating: result.paceRating,
      analysis: {
        confidenceScore: result.confidenceScore,
        strengths: result.strengths,
        improvements: result.improvements,
        clinicalAccuracyNote: result.clinicalAccuracyNote,
        paceFeedback: result.paceFeedback,
        fillerFeedback: result.fillerFeedback,
      },
    });
  };

  const analyzeVoiceAnswer = async (text: string, duration: number) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/voice-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          question: currentQuestion,
          durationSeconds: duration,
          specialty,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const result = data as VoiceAnalysisResult;
        setAnalysisResult(result);
        await saveSession(result, text, duration);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranscriptReady = (text: string, duration: number) => {
    setTranscript(text);
    setDurationSeconds(duration);
    setSessionStage('results');
    analyzeVoiceAnswer(text, duration);
  };

  const tryAgain = () => {
    setAnalysisResult(null);
    setTranscript('');
    setSessionStage('recording');
    setRecorderKey((k) => k + 1);
  };

  const segments =
    analysisResult &&
    buildTranscriptSegments(transcript, analysisResult.fillerWordsFound);

  const pacePercent = analysisResult
    ? Math.min(100, (analysisResult.wordsPerMinute / 200) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8F7FF] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00C6B2]">
          Voice Practice Mode
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black text-[#1a1a2e]">
            Practice Out Loud 🎙️
          </h1>
          <span className="rounded-full bg-[#F59E0B] px-3 py-1 text-[10px] font-bold text-white">
            Premium Feature
          </span>
        </div>
        <p className="mt-3 text-gray-600">
          Record your answer, get instant feedback on filler words, pace, and
          clinical accuracy.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {VOICE_SPECIALTY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSpecialtyKey(opt.key)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                specialtyKey === opt.key
                  ? 'bg-[#7C5CBF] text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-[#7C5CBF]/30'
              )}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative mt-6 rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
        >
          <button
            type="button"
            onClick={loadQuestion}
            disabled={isLoadingQuestion}
            className="absolute right-4 top-4 rounded-full border-2 border-[#7C5CBF] px-3 py-1 text-xs font-bold text-[#7C5CBF] hover:bg-[#7C5CBF]/5 disabled:opacity-50"
          >
            New Question →
          </button>
          {isLoadingQuestion ? (
            <p className="py-8 text-center text-[#7C5CBF]">Loading question...</p>
          ) : (
            <>
              <span className="inline-block rounded-full bg-[#7C5CBF]/10 px-3 py-1 text-xs font-bold text-[#7C5CBF]">
                {questionCategory}
              </span>
              <p className="mt-4 pr-24 text-lg font-bold leading-relaxed text-[#1a1a2e]">
                {currentQuestion}
              </p>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <VoiceRecorder
            key={recorderKey}
            isDisabled={isLoadingQuestion || isAnalyzing}
            onRecordingStart={() => setSessionStage('recording')}
            onRecordingStop={() => {}}
            onTranscriptReady={handleTranscriptReady}
          />
        </motion.div>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-[20px] bg-white p-8 text-center shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mx-auto h-10 w-10 rounded-full border-4 border-[#7C5CBF]/20 border-t-[#7C5CBF]"
              />
              <p className="mt-4 font-bold text-[#1a1a2e]">
                Analyzing your answer...
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={analyzingLine}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-sm text-gray-500"
                >
                  {ANALYZING_LINES[analyzingLine]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {analysisResult && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-[20px] bg-white p-8 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              <ScoreCircle score={analysisResult.overallScore} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              <h3 className="font-bold text-[#1a1a2e]">
                📝 Your Answer (Transcribed)
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {segments?.map((seg, i) =>
                  seg.isFiller ? (
                    <span
                      key={i}
                      className="font-bold text-amber-600 underline decoration-amber-400"
                    >
                      {seg.text}
                    </span>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                {analysisResult.wordCount} words · {durationSeconds}s recorded
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <motion.div className="rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(124,92,191,0.08)]">
                <p
                  className="text-3xl font-black"
                  style={{
                    color: fillerCountColor(analysisResult.fillerWordCount),
                  }}
                >
                  {analysisResult.fillerWordCount}
                </p>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Filler Words
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  {Object.keys(analysisResult.fillerWordsFound).length > 0
                    ? formatFillerList(analysisResult.fillerWordsFound)
                    : 'None detected'}
                </p>
              </motion.div>

              <motion.div className="rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(124,92,191,0.08)]">
                <p className="text-3xl font-black text-[#7C5CBF]">
                  {analysisResult.wordsPerMinute}
                </p>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Speaking Pace (WPM)
                </p>
                <p
                  className={cn(
                    'mt-2 text-sm font-bold',
                    analysisResult.paceRating === 'Just Right'
                      ? 'text-green-600'
                      : analysisResult.paceRating === 'Too Slow'
                        ? 'text-blue-600'
                        : 'text-red-600'
                  )}
                >
                  {analysisResult.paceRating}
                </p>
                <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-green-200 to-red-200" />
                  <motion.div
                    className="absolute top-0 h-full w-1 bg-[#1a1a2e]"
                    style={{ left: `${pacePercent}%` }}
                  />
                </div>
              </motion.div>

              <motion.div className="rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(124,92,191,0.08)]">
                <p className="text-3xl font-black text-[#F59E0B]">
                  {analysisResult.confidenceScore}
                </p>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Confidence
                </p>
                <p className="mt-2 text-lg">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i}>
                      {i < confidenceStars(analysisResult.confidenceScore)
                        ? '⭐'
                        : '☆'}
                    </span>
                  ))}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              <h3 className="font-bold text-[#1a1a2e]">🧠 AI Feedback</h3>
              <div className="mt-4">
                <p className="text-sm font-semibold text-green-700">Strengths</p>
                <ul className="mt-2 space-y-1">
                  {analysisResult.strengths.map((s) => (
                    <li key={s} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-green-600">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-amber-700">Improvements</p>
                <ul className="mt-2 space-y-1">
                  {analysisResult.improvements.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-amber-600">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {analysisResult.clinicalAccuracyNote}
              </p>
              {analysisResult.paceFeedback && (
                <p className="mt-2 text-sm text-gray-600">
                  {analysisResult.paceFeedback}
                </p>
              )}
              {analysisResult.fillerFeedback && (
                <p className="mt-2 text-sm text-gray-600">
                  {analysisResult.fillerFeedback}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={tryAgain}
                className="flex-1 rounded-full border-2 border-[#7C5CBF] py-3 text-sm font-bold text-[#7C5CBF]"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={loadQuestion}
                className="flex-1 rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] py-3 text-sm font-bold text-white"
              >
                New Question →
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
