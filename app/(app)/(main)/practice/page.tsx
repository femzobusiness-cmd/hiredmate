'use client';

import AnswerInput from '@/components/practice/AnswerInput';
import FeedbackPanel from '@/components/practice/FeedbackPanel';
import QuestionCard from '@/components/practice/QuestionCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/utils/cn';
import { Check, Loader2, RotateCcw, Share2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

type SessionMode = 'written' | 'multiple_choice';
type QuestionCategory = 'clinical' | 'behavioral' | 'salary' | 'multiple_choice';
type OptionKey = 'A' | 'B' | 'C' | 'D';

interface Question {
  question: string;
  category: QuestionCategory;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sample_answer: string;
  model_answer?: string;
}

interface MultipleChoiceQuestion extends Question {
  category: 'multiple_choice';
  type: 'multiple_choice';
  options: Record<OptionKey, string>;
  correct_answer: OptionKey;
  explanation: string;
}

export default function PracticePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string>('');
  const [mode, setMode] = useState<SessionMode>('written');
  const [mcIndex, setMcIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<MultipleChoiceQuestion[]>([]);
  const [mcFinished, setMcFinished] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setMcIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setWrongAnswers([]);
    setMcFinished(false);
    setFeedback(null);
    setAnswer('');
    setStartTime(Date.now());

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('specialty')
        .maybeSingle();

      setSpecialty(profile?.specialty || 'nursing');

      let res: Response;
      try {
        res = await fetch('/api/generate-questions', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      } catch (fetchError) {
        const msg =
          fetchError instanceof Error ? fetchError.message : 'fetch failed';
        throw new Error(
          `Could not reach /api/generate-questions (${msg}). Check that the dev server is running on the same port as the app.`
        );
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || 'Failed to load questions');

      setSessionId(data.sessionId);

      const allQuestions: Question[] = [
        ...(data.questions?.clinical_scenarios || []).map(
          (q: { question: string }) => ({
            question: q.question,
            category: 'clinical' as const,
          })
        ),
        ...(data.questions?.behavioral_questions || []).map(
          (q: { question: string }) => ({
            question: q.question,
            category: 'behavioral' as const,
          })
        ),
        ...(data.questions?.salary_scripts || []).map(
          (q: { scenario: string }) => ({
            question: q.scenario,
            category: 'salary' as const,
          })
        ),
        ...(data.questions?.multiple_choice || []).map(
          (q: MultipleChoiceQuestion) => ({
            question: q.question,
            category: 'multiple_choice' as const,
            type: 'multiple_choice' as const,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })
        ),
      ];

      setQuestions(allQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const writtenQuestions = useMemo(
    () => questions.filter((q) => q.category === 'clinical'),
    [questions]
  );

  const multipleChoiceQuestions = useMemo(
    () =>
      questions.filter(
        (q): q is MultipleChoiceQuestion => q.category === 'multiple_choice'
      ),
    [questions]
  );

  const handleSubmit = async () => {
    if (!writtenQuestions[currentIndex]) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/score-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: writtenQuestions[currentIndex].question,
          answer,
          sessionId,
          specialty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score answer');

      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setAnswer('');
    if (currentIndex < writtenQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (sessionId) {
      router.push(`/session/${sessionId}`);
    }
  };

  const switchMode = (nextMode: SessionMode) => {
    setMode(nextMode);
    setError(null);
    setFeedback(null);
    setAnswer('');
    setSelectedOption(null);
  };

  const handleMultipleChoiceAnswer = (option: OptionKey) => {
    if (selectedOption) return;

    const current = multipleChoiceQuestions[mcIndex];
    setSelectedOption(option);

    if (option === current.correct_answer) {
      setCorrectCount((count) => count + 1);
    } else {
      setWrongAnswers((answers) => [...answers, current]);
    }
  };

  const handleNextMultipleChoice = () => {
    setSelectedOption(null);
    if (mcIndex < multipleChoiceQuestions.length - 1) {
      setMcIndex((index) => index + 1);
    } else {
      setMcFinished(true);
    }
  };

  const resetMultipleChoice = () => {
    setMcIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setWrongAnswers([]);
    setMcFinished(false);
    setStartTime(Date.now());
  };

  const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const formattedTime =
    elapsedSeconds < 60
      ? `${elapsedSeconds}s`
      : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;

  const currentWritten = writtenQuestions[currentIndex];
  const currentMc = multipleChoiceQuestions[mcIndex];
  const mcTotal = multipleChoiceQuestions.length;
  const mcScore = mcTotal > 0 ? Math.round((correctCount / mcTotal) * 100) : 0;
  const hasStarted = questions.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Practice Session</h1>
          <p className="text-body-text">Choose written prep or quick-fire clinical questions</p>
        </div>

        {mode === 'multiple_choice' && (
          <div className="rounded-pill bg-light-bg px-4 py-2 text-sm font-semibold text-primary">
            {correctCount}/{mcTotal} correct
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => switchMode('written')}
          className={cn(
            'rounded-pill border-2 px-5 py-3 text-sm font-semibold transition-all',
            mode === 'written'
              ? 'border-primary bg-primary text-white'
              : 'border-primary bg-white text-primary hover:bg-light-bg'
          )}
        >
          Written Practice
        </button>
        <button
          type="button"
          onClick={() => switchMode('multiple_choice')}
          className={cn(
            'rounded-pill border-2 px-5 py-3 text-sm font-semibold transition-all',
            mode === 'multiple_choice'
              ? 'border-primary bg-primary text-white'
              : 'border-primary bg-white text-primary hover:bg-light-bg'
          )}
        >
          Multiple Choice
        </button>
      </div>

      {error && (
        <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!hasStarted && !loading && (
        <Card className="text-center">
          <p className="mb-2 text-lg font-bold text-dark-text">
            Ready to start {mode === 'written' ? 'written practice' : 'multiple choice'}?
          </p>
          <p className="mx-auto mb-6 max-w-md text-sm text-body-text">
            You&apos;ll get 5 written clinical scenarios and 5 quick-fire multiple
            choice questions tailored to your profile.
          </p>
          <Button onClick={loadSession} size="lg">
            Start {mode === 'written' ? 'Written Practice' : 'Multiple Choice'} →
          </Button>
        </Card>
      )}

      {loading && (
        <Card className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium text-dark-text">
            Generating your personalized questions...
          </p>
        </Card>
      )}

      {mode === 'written' && hasStarted && currentWritten && (
        <>
          <QuestionCard
            question={currentWritten.question}
            category={currentWritten.category}
            questionNumber={currentIndex + 1}
            totalQuestions={writtenQuestions.length}
          />

          {!feedback ? (
            <AnswerInput
              value={answer}
              onChange={setAnswer}
              onSubmit={handleSubmit}
              loading={submitting}
            />
          ) : (
            <>
              <FeedbackPanel feedback={feedback} />
              <Button onClick={handleNext} className="w-full">
                {currentIndex < writtenQuestions.length - 1
                  ? 'Next Question →'
                  : 'Finish Session →'}
              </Button>
            </>
          )}
        </>
      )}

      {mode === 'multiple_choice' && hasStarted && mcFinished && (
        <Card className="space-y-6 text-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-body-text">
              Multiple Choice Complete
            </p>
            <p className="mt-2 text-6xl font-bold text-primary">{mcScore}%</p>
            <p className="mt-2 text-lg font-semibold text-dark-text">
              {correctCount} out of {mcTotal} correct
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-card bg-light-bg p-4">
              <p className="text-xs font-semibold text-body-text">Mode used</p>
              <p className="font-bold text-dark-text">Multiple Choice</p>
            </div>
            <div className="rounded-card bg-light-bg p-4">
              <p className="text-xs font-semibold text-body-text">Time taken</p>
              <p className="font-bold text-dark-text">{formattedTime}</p>
            </div>
            <div className="rounded-card bg-light-bg p-4">
              <p className="text-xs font-semibold text-body-text">Weakest category</p>
              <p className="font-bold text-dark-text">
                {wrongAnswers.length > 0 ? 'Clinical prioritization' : 'None'}
              </p>
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="text-left">
              <h2 className="mb-3 font-bold text-dark-text">
                Questions to review
              </h2>
              <div className="space-y-2">
                {wrongAnswers.map((question, index) => (
                  <div
                    key={`${question.question}-${index}`}
                    className="rounded-card border border-primary/10 bg-white p-4 text-sm text-body-text"
                  >
                    {question.question}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button onClick={resetMultipleChoice}>
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </Button>
            <Button variant="outline" onClick={() => switchMode('written')}>
              Switch to Written Mode
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigator.clipboard?.writeText(
                  `I scored ${mcScore}% on my HiredMate nursing interview prep session!`
                )
              }
            >
              <Share2 className="h-4 w-4" />
              Share your score
            </Button>
          </div>
        </Card>
      )}

      {mode === 'multiple_choice' && hasStarted && !mcFinished && currentMc && (
        <div className="space-y-5">
          <QuestionCard
            question={currentMc.question}
            category="multiple_choice"
            questionNumber={mcIndex + 1}
            totalQuestions={mcTotal}
          />

          <div className="space-y-3">
            {(Object.keys(currentMc.options) as OptionKey[]).map((key) => {
              const isSelected = selectedOption === key;
              const isCorrect = currentMc.correct_answer === key;
              const showCorrect = selectedOption && isCorrect;
              const showWrong = selectedOption && isSelected && !isCorrect;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMultipleChoiceAnswer(key)}
                  disabled={!!selectedOption}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-pill border-2 px-5 py-4 text-left font-semibold transition-all',
                    !selectedOption &&
                      'border-primary/40 bg-white text-dark-text hover:border-primary hover:bg-light-bg',
                    isSelected &&
                      'border-primary bg-primary text-white',
                    showCorrect &&
                      'border-green-500 bg-green-500 text-white',
                    showWrong && 'border-red-500 bg-red-500 text-white',
                    selectedOption && !showCorrect && !showWrong && 'bg-white text-body-text'
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 font-bold">
                    {showCorrect ? (
                      <Check className="h-5 w-5" />
                    ) : showWrong ? (
                      <X className="h-5 w-5" />
                    ) : (
                      key
                    )}
                  </span>
                  <span>{currentMc.options[key]}</span>
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <Card className="border border-primary/10 bg-light-bg">
              <p className="mb-2 font-bold text-dark-text">
                {selectedOption === currentMc.correct_answer
                  ? 'Correct!'
                  : `Not quite. The correct answer is ${currentMc.correct_answer}.`}
              </p>
              <p className="text-sm leading-relaxed text-body-text">
                {currentMc.explanation}
              </p>
            </Card>
          )}

          {selectedOption && (
            <Button onClick={handleNextMultipleChoice} className="w-full">
              Next Question →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
