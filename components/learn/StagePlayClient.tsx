'use client';

import { StageCompletionScreen } from '@/components/learn/StageCompletionScreen';
import AnswerInput from '@/components/practice/AnswerInput';
import FeedbackPanel from '@/components/practice/FeedbackPanel';
import QuestionCard from '@/components/practice/QuestionCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { NextStageInfo, StageRow, WorldRow } from '@/lib/learning-path';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type StagePlayClientProps = {
  stage: StageRow;
  world: WorldRow;
};

type QueueItem =
  | { kind: 'written'; question: string; tips?: string }
  | {
      kind: 'mc';
      question: string;
      options: Record<'A' | 'B' | 'C' | 'D', string>;
      correct_answer: 'A' | 'B' | 'C' | 'D';
      explanation: string;
    }
  | {
      kind: 'blank';
      sentence: string;
      explanation: string;
      blanks: Record<string, { correct: string; options: string[] }>;
    };

type Feedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  sample_answer: string;
};

export function StagePlayClient({ stage, world }: StagePlayClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [weakest, setWeakest] = useState<{ q: string; score: number } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [startTime] = useState(() => Date.now());
  const [mcSelected, setMcSelected] = useState<string | null>(null);
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});

  const loadStage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage_key: stage.key,
          world_key: world.key,
          stage_title: stage.title,
          stage_topic: stage.description,
          stage_type: stage.stage_type,
          world_title: world.title,
          questions_count: stage.questions_count,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load stage');

      const items: QueueItem[] = [];
      for (const q of data.questions?.clinical_scenarios || []) {
        items.push({ kind: 'written', question: q.question, tips: q.tips });
      }
      for (const q of data.questions?.multiple_choice || []) {
        items.push({
          kind: 'mc',
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        });
      }
      for (const q of data.questions?.clinical_blanks || []) {
        items.push({
          kind: 'blank',
          sentence: q.sentence,
          explanation: q.explanation,
          blanks: q.blanks,
        });
      }

      setQueue(items.slice(0, stage.questions_count));
      setSessionId(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [stage, world]);

  useEffect(() => {
    void loadStage();
  }, [loadStage]);

  const current = queue[index];
  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  const recordScore = (score: number, questionText: string) => {
    setScores((prev) => [...prev, score]);
    if (!weakest || score < weakest.score) {
      setWeakest({ q: questionText, score });
    }
  };

  const finishStage = async (finalScores: number[]) => {
    const avg =
      finalScores.length > 0
        ? Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length)
        : 0;

    const res = await fetch('/api/stages/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stageKey: stage.key,
        worldKey: world.key,
        score: avg,
        weakestQuestion: weakest?.q,
      }),
    });
    const data = await res.json();
    setResult(data);
    setFinished(true);
  };

  const goNext = (finalScores: number[]) => {
    if (index + 1 >= queue.length) {
      void finishStage(finalScores);
    } else {
      setIndex((i) => i + 1);
      setFeedback(null);
      setAnswer('');
      setMcSelected(null);
      setBlankAnswers({});
    }
  };

  const submitWritten = async () => {
    if (!current || current.kind !== 'written') return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/score-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: current.question,
          answer,
          sessionId,
          specialty: 'nursing',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback(data);
      const nextScores = [...scores, data.score];
      setScores(nextScores);
      recordScore(data.score, current.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitMc = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!current || current.kind !== 'mc' || mcSelected) return;
    setMcSelected(option);
    const correct = option === current.correct_answer;
    const score = correct ? 100 : 0;
    const nextScores = [...scores, score];
    setScores(nextScores);
    recordScore(score, current.question);
    window.setTimeout(() => goNext(nextScores), 1200);
  };

  const submitBlank = () => {
    if (!current || current.kind !== 'blank') return;
    const blanks = Object.entries(current.blanks);
    const correctCount = blanks.filter(
      ([k, b]) => blankAnswers[k] === b.correct
    ).length;
    const score = Math.round((correctCount / blanks.length) * 100);
    const nextScores = [...scores, score];
    setScores(nextScores);
    recordScore(score, current.sentence);
    goNext(nextScores);
  };

  const avgScore = useMemo(
    () =>
      scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
    [scores]
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="font-semibold text-text-secondary">Loading stage…</span>
      </div>
    );
  }

  if (finished && result) {
    return (
      <StageCompletionScreen
        passed={Boolean(result.passed)}
        score={Number(result.score) || avgScore}
        passingScore={stage.passing_score}
        stars={Number(result.stars) || 0}
        xpAwarded={Number(result.xpAwarded) || 0}
        isBoss={stage.is_boss_stage}
        worldComplete={Boolean(result.worldComplete)}
        weakestQuestion={weakest?.q}
        nextStage={(result.nextStage as NextStageInfo | null) ?? null}
        worldKey={world.key}
        onRetry={() => {
          setFinished(false);
          setResult(null);
          setIndex(0);
          setScores([]);
          setWeakest(null);
          void loadStage();
        }}
      />
    );
  }

  return (
    <motion.div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        <Link href="/learn" className="hover:text-primary">
          Learning Path
        </Link>
        <span>/</span>
        <Link href={`/learn/${world.key}`} className="hover:text-primary">
          {world.title}
        </Link>
      </div>

      <Card
        className={cn(
          'border-2 p-5',
          stage.is_boss_stage ? 'border-red-200 bg-red-50/50' : 'border-purple-100'
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {world.title}
            </p>
            <h1 className="text-2xl font-black text-text-primary">{stage.title}</h1>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-text-primary">
              {Math.min(index + 1, queue.length)} / {queue.length}
            </p>
            <p className="text-amber-600 font-bold">+{stage.xp_reward} XP</p>
            {stage.is_boss_stage && (
              <p className="text-red-600 font-semibold">{elapsed}s</p>
            )}
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-100">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((index + (feedback ? 1 : 0)) / queue.length) * 100}%` }}
            transition={{ type: 'tween', duration: 0.4 }}
          />
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700">{error}</Card>
      )}

      {current?.kind === 'written' && (
        <>
          <QuestionCard
            question={current.question}
            category="clinical"
            questionNumber={index + 1}
            totalQuestions={queue.length}
          />
          {current.tips && (
            <p className="text-sm text-text-secondary">{current.tips}</p>
          )}
          {!feedback ? (
            <>
              <AnswerInput
                value={answer}
                onChange={setAnswer}
                onSubmit={() => void submitWritten()}
                loading={submitting}
              />
              <Button
                className="w-full"
                disabled={!answer.trim() || submitting}
                onClick={() => void submitWritten()}
              >
                {submitting ? 'Scoring…' : 'Submit Answer'}
              </Button>
            </>
          ) : (
            <>
              <FeedbackPanel feedback={feedback} />
              <Button
                className="w-full"
                onClick={() => goNext(scores)}
              >
                {index + 1 >= queue.length ? 'Finish Stage' : 'Next Question'}
              </Button>
            </>
          )}
        </>
      )}

      {current?.kind === 'mc' && (
        <Card>
          <p className="mb-4 font-medium text-text-primary">{current.question}</p>
          <div className="space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map((key) => (
              <button
                key={key}
                type="button"
                disabled={!!mcSelected}
                onClick={() => submitMc(key)}
                className={cn(
                  'w-full rounded-card border p-3 text-left text-sm transition',
                  mcSelected === key &&
                    key === current.correct_answer &&
                    'border-green-500 bg-green-50',
                  mcSelected === key &&
                    key !== current.correct_answer &&
                    'border-red-400 bg-red-50',
                  !mcSelected && 'hover:border-primary hover:bg-purple-50'
                )}
              >
                <span className="font-bold text-primary">{key}.</span> {current.options[key]}
              </button>
            ))}
          </div>
        </Card>
      )}

      {current?.kind === 'blank' && (
        <Card>
          <p className="mb-4 text-text-primary">{current.sentence}</p>
          <div className="space-y-3">
            {Object.entries(current.blanks).map(([key, blank]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-text-muted">{key}</label>
                <select
                  className="mt-1 w-full rounded-card border border-border p-2"
                  value={blankAnswers[key] || ''}
                  onChange={(e) =>
                    setBlankAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  {blank.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={submitBlank}>
            Submit
          </Button>
        </Card>
      )}
    </motion.div>
  );
}
