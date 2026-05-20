'use client';

import AnswerInput from '@/components/practice/AnswerInput';
import RankBadge from '@/components/gamification/RankBadge';
import RankUpModal from '@/components/gamification/RankUpModal';
import FeedbackPanel from '@/components/practice/FeedbackPanel';
import QuestionCard from '@/components/practice/QuestionCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { QuestCompleteBanner } from '@/components/quests/QuestCompleteBanner';
import { QuestCompleteToast } from '@/components/quests/QuestCompleteToast';
import { SkillLevelUpToast } from '@/components/skills/SkillLevelUpToast';
import type { Rank } from '@/lib/gamification';
import type { CompletedQuest } from '@/lib/quests';
import type { SkillLevelUpResult } from '@/lib/skill-progress';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SKILLS, getSkillByKey } from '@/lib/skills';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/utils/cn';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, RotateCcw, Share2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type SessionMode = 'written' | 'multiple_choice' | 'clinical_blanks';
type QuestionCategory = 'clinical' | 'behavioral' | 'salary' | 'multiple_choice' | 'clinical_blank';
type OptionKey = 'A' | 'B' | 'C' | 'D';

interface Question {
  question: string;
  category: QuestionCategory;
  skill_key?: string;
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

interface ClinicalBlankQuestion extends Question {
  category: 'clinical_blank';
  type: 'clinical_blank';
  sentence: string;
  explanation: string;
  blanks: Record<string, { correct: string; options: string[] }>;
}

type GamificationResult = {
  xpEarned: number;
  totalXp: number;
  oldRank: Rank;
  newRank: Rank;
  rankedUp: boolean;
  currentStreak: number;
  earnedAchievements: string[];
  completedQuests?: CompletedQuest[];
};

const CONFETTI_COLORS = ['#7C5CBF', '#00C6B2', '#F59E0B', '#ffffff', '#9B7FD4'];

export default function PracticePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { playCorrect, playWrong, playLevelUp } = useSound();

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
  const [profileSetupRequired, setProfileSetupRequired] = useState(false);
  const [profileXp, setProfileXp] = useState(0);
  const [rankTitle, setRankTitle] = useState('Student Nurse');
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [blankSubmitted, setBlankSubmitted] = useState(false);
  const [blankIndex, setBlankIndex] = useState(0);
  const [blankScore, setBlankScore] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [rankUp, setRankUp] = useState<GamificationResult | null>(null);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [floatingXp, setFloatingXp] = useState<{ key: string; amount: number } | null>(null);
  const [autoAdvancingMc, setAutoAdvancingMc] = useState(false);
  const [skillFocus, setSkillFocus] = useState<string | null>(null);
  const [skillLevelUp, setSkillLevelUp] = useState<SkillLevelUpResult | null>(null);
  const [questToast, setQuestToast] = useState<CompletedQuest | null>(null);
  const [questBanner, setQuestBanner] = useState<CompletedQuest | null>(null);

  useEffect(() => {
    const skillFromUrl = new URLSearchParams(window.location.search).get('skill');
    if (skillFromUrl && getSkillByKey(skillFromUrl)) {
      setSkillFocus(skillFromUrl);
    }
  }, []);

  const focusedSkill = skillFocus ? getSkillByKey(skillFocus) : null;

  const handleQuestCompletions = useCallback(
    (completedQuests?: CompletedQuest[]) => {
      if (!completedQuests?.length) return;
      const first = completedQuests[0];
      setQuestBanner(first);
      setQuestToast(first);
      const bonusXp = completedQuests.reduce((sum, q) => sum + q.xpReward, 0);
      setProfileXp((xp) => xp + bonusXp);
      router.refresh();
    },
    [router]
  );

  const finishSessionQuests = useCallback(
    async (score: number, sessionMode: SessionMode) => {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCompleted: true,
          score,
          mode: sessionMode,
          clinicalBlanksSession: sessionMode === 'clinical_blanks',
        }),
      });
      const data = await res.json().catch(() => ({}));
      handleQuestCompletions(data.completedQuests);
    },
    [handleQuestCompletions]
  );

  const recordSkillProgress = useCallback(
    async (
      skillKey: string | undefined,
      score: number,
      question: string,
      answer?: string
    ) => {
      if (!skillKey || !sessionId) return;
      const res = await fetch('/api/skill-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillKey,
          score,
          sessionId,
          question,
          answer,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.skillLevelUp?.leveledUp) {
        setSkillLevelUp(data.skillLevelUp);
        playLevelUp();
      }
    },
    [sessionId, playLevelUp]
  );

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
    setBlankAnswers({});
    setBlankSubmitted(false);
    setBlankIndex(0);
    setBlankScore(null);
    setFloatingXp(null);
    setAutoAdvancingMc(false);
    setStartTime(Date.now());
    setProfileSetupRequired(false);

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('specialty, total_xp, rank_title, sound_effects_enabled')
        .maybeSingle();

      setSpecialty(profile?.specialty || 'nursing');
      setProfileXp(profile?.total_xp || 0);
      setRankTitle(profile?.rank_title || 'Student Nurse');
      localStorage.setItem(
        'sound_effects',
        profile?.sound_effects_enabled ? 'true' : 'false'
      );

      let res: Response;
      try {
        res = await fetch('/api/generate-questions', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillFocus }),
        });
      } catch (fetchError) {
        const msg =
          fetchError instanceof Error ? fetchError.message : 'fetch failed';
        throw new Error(
          `Could not reach /api/generate-questions (${msg}). Check that the dev server is running on the same port as the app.`
        );
      }

      const data = await res.json().catch(() => ({}));

      if (
        !res.ok &&
        data.error ===
          'Please complete your profile setup in Settings before starting a practice session'
      ) {
        setProfileSetupRequired(true);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to load questions');

      setSessionId(data.sessionId);

      const allQuestions: Question[] = [
        ...(data.questions?.clinical_scenarios || []).map(
          (q: { question: string; skill_key?: string }) => ({
            question: q.question,
            category: 'clinical' as const,
            skill_key: q.skill_key,
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
          (q: MultipleChoiceQuestion & { skill_key?: string }) => ({
            question: q.question,
            category: 'multiple_choice' as const,
            type: 'multiple_choice' as const,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            skill_key: q.skill_key,
          })
        ),
        ...(data.questions?.clinical_blanks || []).map(
          (q: ClinicalBlankQuestion & { skill_key?: string }) => ({
            question: q.sentence,
            category: 'clinical_blank' as const,
            type: 'clinical_blank' as const,
            sentence: q.sentence,
            blanks: q.blanks,
            explanation: q.explanation,
            skill_key: q.skill_key,
          })
        ),
      ];

      setQuestions(allQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [skillFocus, supabase]);

  const writtenQuestions = useMemo(
    () =>
      questions.filter(
        (q): q is Question & { category: 'clinical' } => q.category === 'clinical'
      ),
    [questions]
  );

  const multipleChoiceQuestions = useMemo(
    () =>
      questions.filter(
        (q): q is MultipleChoiceQuestion => q.category === 'multiple_choice'
      ),
    [questions]
  );

  const clinicalBlankQuestions = useMemo(
    () =>
      questions.filter(
        (q): q is ClinicalBlankQuestion => q.category === 'clinical_blank'
      ),
    [questions]
  );

  const celebrate = (score: number) => {
    if (score >= 90) {
      confetti({
        particleCount: 300,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#7C5CBF', '#00C6B2', '#F59E0B', '#ffffff'],
      });
      playLevelUp();
    } else if (score >= 70) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: CONFETTI_COLORS,
      });
      playCorrect();
    }
  };

  const triggerWrongAnimation = (key = 'page') => {
    setShakeKey(key);
    setWrongFlash(true);
    playWrong();
    window.setTimeout(() => {
      setShakeKey(null);
      setWrongFlash(false);
    }, 650);
  };

  const updateGamification = async (
    score: number,
    nextMode: SessionMode,
    options?: { questionsAnswered?: number; clinicalBlanksSession?: boolean }
  ) => {
    const res = await fetch('/api/gamification/complete-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score,
        mode: nextMode,
        elapsedSeconds: Math.max(1, Math.round((Date.now() - startTime) / 1000)),
        questionsAnswered: options?.questionsAnswered,
        clinicalBlanksSession: options?.clinicalBlanksSession,
      }),
    });
    const data = (await res.json().catch(() => null)) as GamificationResult | null;
    if (!res.ok || !data) return;

    setProfileXp(data.totalXp);
    handleQuestCompletions(data.completedQuests);
    setRankTitle(data.newRank.title);
    if (data.rankedUp) {
      setRankUp(data);
      confetti({
        particleCount: 400,
        spread: 140,
        origin: { y: 0.45 },
        colors: CONFETTI_COLORS,
      });
      playLevelUp();
    }
    if (data.earnedAchievements.length > 0) {
      setAchievementToast(data.earnedAchievements[0]);
      window.setTimeout(() => setAchievementToast(null), 4000);
    }
    router.refresh();
  };

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
          skillKey: writtenQuestions[currentIndex].skill_key || skillFocus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score answer');

      if (data.skillLevelUp?.leveledUp) {
        setSkillLevelUp(data.skillLevelUp);
      }
      handleQuestCompletions(data.completedQuests);

      setFeedback(data);
      if (data.score >= 70) {
        window.setTimeout(() => celebrate(data.score), 50);
      } else {
        triggerWrongAnimation('written');
      }
      await updateGamification(data.score, 'written');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const lastScore = feedback?.score ?? 0;
    setFeedback(null);
    setAnswer('');
    if (currentIndex < writtenQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (sessionId) {
      void finishSessionQuests(lastScore, 'written');
      router.push(`/session/${sessionId}`);
    }
  };

  const switchMode = (nextMode: SessionMode) => {
    setMode(nextMode);
    setError(null);
    setFeedback(null);
    setAnswer('');
    setSelectedOption(null);
    setBlankAnswers({});
    setBlankSubmitted(false);
    setBlankScore(null);
  };

  const handleMultipleChoiceAnswer = (option: OptionKey) => {
    if (selectedOption || autoAdvancingMc) return;

    const current = multipleChoiceQuestions[mcIndex];
    const isCorrect = option === current.correct_answer;
    const nextCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    setSelectedOption(option);
    setAutoAdvancingMc(true);

    if (isCorrect) {
      setCorrectCount(nextCorrectCount);
      setFloatingXp({ key: `mc-${option}`, amount: 10 });
      celebrate(100);
      window.setTimeout(() => setFloatingXp(null), 850);
    } else {
      setWrongAnswers((answers) => [...answers, current]);
      triggerWrongAnimation(`mc-${option}`);
    }

    void recordSkillProgress(
      current.skill_key || skillFocus || undefined,
      isCorrect ? 100 : 0,
      current.question,
      option
    );

    window.setTimeout(() => {
      setSelectedOption(null);
      setFloatingXp(null);
      setAutoAdvancingMc(false);

      if (mcIndex < multipleChoiceQuestions.length - 1) {
        setMcIndex((index) => index + 1);
        return;
      }

      const finalScore =
        mcTotal > 0 ? Math.round((nextCorrectCount / mcTotal) * 100) : 0;
      setMcFinished(true);
      void updateGamification(finalScore, 'multiple_choice', {
        questionsAnswered: mcTotal,
      });
      void finishSessionQuests(finalScore, 'multiple_choice');
    }, isCorrect ? 1000 : 1200);
  };

  const resetMultipleChoice = () => {
    setMcIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setWrongAnswers([]);
    setMcFinished(false);
    setFloatingXp(null);
    setAutoAdvancingMc(false);
    setStartTime(Date.now());
  };

  const currentBlank = clinicalBlankQuestions[blankIndex];

  const submitClinicalBlank = async () => {
    if (!currentBlank) return;
    const blanks = Object.entries(currentBlank.blanks);
    const correctCountForBlank = blanks.filter(
      ([key, blank]) => blankAnswers[key] === blank.correct
    ).length;
    const score = Math.round((correctCountForBlank / blanks.length) * 100);
    setBlankScore(score);
    setBlankSubmitted(true);

    if (score === 100) {
      celebrate(100);
    } else {
      const wrong = blanks.find(([key, blank]) => blankAnswers[key] !== blank.correct);
      triggerWrongAnimation(wrong?.[0] || 'blank');
    }

    await recordSkillProgress(
      currentBlank.skill_key || skillFocus || undefined,
      score,
      currentBlank.sentence,
      JSON.stringify(blankAnswers)
    );
    await updateGamification(score, 'clinical_blanks', {
      questionsAnswered: 1,
    });
  };

  const nextClinicalBlank = () => {
    setBlankAnswers({});
    setBlankSubmitted(false);
    setBlankScore(null);
    if (blankIndex < clinicalBlankQuestions.length - 1) {
      setBlankIndex((index) => index + 1);
    } else if (sessionId) {
      const avg = blankScore ?? 0;
      void finishSessionQuests(avg, 'clinical_blanks');
      router.push(`/session/${sessionId}`);
    }
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
    <div className={cn('mx-auto max-w-2xl space-y-6', wrongFlash && 'wrong-flash')}>
      <SkillLevelUpToast
        levelUp={skillLevelUp}
        onDismiss={() => setSkillLevelUp(null)}
      />
      <QuestCompleteToast
        quest={questToast}
        onDismiss={() => setQuestToast(null)}
      />
      <QuestCompleteBanner
        quest={questBanner}
        onDismiss={() => setQuestBanner(null)}
      />
      {achievementToast && (
        <div className="fixed right-5 top-5 z-[70] rounded-card bg-purple-gradient px-5 py-4 font-bold text-white shadow-card">
          🏆 Achievement Unlocked: {achievementToast.replace(/_/g, ' ')}!
        </div>
      )}
      {rankUp && (
        <RankUpModal
          oldRank={rankUp.oldRank}
          newRank={rankUp.newRank}
          onContinue={() => setRankUp(null)}
        />
      )}
      {profileSetupRequired && (
        <Card className="text-center">
          <p className="mb-2 text-2xl font-black text-text-primary">
            Complete your profile first
          </p>
          <p className="mx-auto mb-6 max-w-md text-sm text-text-secondary">
            Please complete your profile setup in Settings before starting a
            practice session.
          </p>
          <Button onClick={() => router.push('/update-cursor-settings')} size="lg">
            Go to profile setup
          </Button>
        </Card>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Practice Session</h1>
          <p className="text-text-secondary">Choose written prep or quick-fire clinical questions</p>
          <div className="mt-3">
            <RankBadge totalXp={profileXp} title={rankTitle} showProgress />
          </div>
        </div>

        {mode === 'multiple_choice' && (
          <div className="rounded-pill border border-border bg-card px-4 py-2 text-sm font-semibold text-secondary">
            {correctCount}/{mcTotal} correct
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => switchMode('written')}
          className={cn(
            'rounded-pill border px-5 py-3 text-sm font-semibold transition-all',
            mode === 'written'
              ? 'border-primary bg-purple-gradient text-white'
              : 'border-input-border bg-card text-primary hover:border-primary/70'
          )}
        >
          Written Practice
        </button>
        <button
          type="button"
          onClick={() => switchMode('multiple_choice')}
          className={cn(
            'rounded-pill border px-5 py-3 text-sm font-semibold transition-all',
            mode === 'multiple_choice'
              ? 'border-primary bg-purple-gradient text-white'
              : 'border-input-border bg-card text-primary hover:border-primary/70'
          )}
        >
          Multiple Choice
        </button>
        <button
          type="button"
          onClick={() => switchMode('clinical_blanks')}
          className={cn(
            'rounded-pill border px-5 py-3 text-sm font-semibold transition-all',
            mode === 'clinical_blanks'
              ? 'border-primary bg-purple-gradient text-white'
              : 'border-input-border bg-card text-primary hover:border-primary/70'
          )}
        >
          Clinical Blanks
        </button>
      </div>

      {error && (
        <p className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!hasStarted && !loading && !profileSetupRequired && (
        <Card className="space-y-6">
          <div>
            <p className="text-sm font-bold text-text-primary">
              Focus on a specific skill? (optional)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SKILLS.map((skill) => {
                const selected = skillFocus === skill.key;
                return (
                  <button
                    key={skill.key}
                    type="button"
                    onClick={() =>
                      setSkillFocus((current) =>
                        current === skill.key ? null : skill.key
                      )
                    }
                    className={cn(
                      'rounded-pill border px-3 py-2 text-sm font-semibold transition-all',
                      selected
                        ? 'border-transparent text-white shadow-button'
                        : 'border-border bg-white text-text-secondary hover:border-primary/40'
                    )}
                    style={
                      selected
                        ? { backgroundColor: skill.color }
                        : undefined
                    }
                  >
                    {skill.icon} {skill.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center">
          <p className="mb-2 text-lg font-bold text-text-primary">
            Ready to start{' '}
            {mode === 'written'
              ? 'written practice'
              : mode === 'multiple_choice'
                ? 'multiple choice'
                : 'clinical blanks'}
          </p>
          <p className="mx-auto mb-6 max-w-md text-sm text-text-secondary">
            You&apos;ll get written scenarios, quick-fire questions, and clinical
            fill-in-the-blank drills tailored to your profile.
          </p>
          <Button onClick={loadSession} size="lg">
            Start{' '}
            {mode === 'written'
              ? 'Written Practice'
              : mode === 'multiple_choice'
                ? 'Multiple Choice'
                : 'Clinical Blanks'}
          </Button>
          </div>
        </Card>
      )}

      {hasStarted && focusedSkill && (
        <div
          className="rounded-pill border px-4 py-2 text-sm font-bold text-white shadow-card"
          style={{ backgroundColor: focusedSkill.color }}
        >
          Practicing: {focusedSkill.icon} {focusedSkill.name}
        </div>
      )}

      {loading && (
        <Card className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium text-text-primary">
            Generating your personalized questions...
          </p>
        </Card>
      )}

      {mode === 'written' && hasStarted && currentWritten && (
        <AnimatePresence mode="wait">
        <motion.div
          key={`written-${currentIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn('space-y-5', shakeKey === 'written' && 'shake')}
        >
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
                  ? 'Next Question'
                  : 'Finish Session'}
              </Button>
            </>
          )}
        </motion.div>
        </AnimatePresence>
      )}

      {mode === 'multiple_choice' && hasStarted && mcFinished && (
        <Card className="space-y-6 text-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Multiple Choice Complete
            </p>
            <p className="mt-2 text-6xl font-bold text-primary">{mcScore}%</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {correctCount} out of {mcTotal} correct
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-card border border-border bg-input p-4">
              <p className="text-xs font-semibold text-text-muted">Mode used</p>
              <p className="font-bold text-text-primary">Multiple Choice</p>
            </div>
            <div className="rounded-card border border-border bg-input p-4">
              <p className="text-xs font-semibold text-text-muted">Time taken</p>
              <p className="font-bold text-text-primary">{formattedTime}</p>
            </div>
            <div className="rounded-card border border-border bg-input p-4">
              <p className="text-xs font-semibold text-text-muted">Weakest category</p>
              <p className="font-bold text-text-primary">
                {wrongAnswers.length > 0 ? 'Clinical prioritization' : 'None'}
              </p>
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="text-left">
              <h2 className="mb-3 font-bold text-text-primary">
                Questions to review
              </h2>
              <div className="space-y-2">
                {wrongAnswers.map((question, index) => (
                  <div
                    key={`${question.question}-${index}`}
                    className="rounded-card border border-border bg-input p-4 text-sm text-text-secondary"
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
        <AnimatePresence mode="wait">
        <motion.div
          key={`mc-${mcIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="space-y-5"
        >
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
                    'relative flex w-full items-center gap-3 rounded-card border px-5 py-4 text-left font-semibold transition-all',
                    !selectedOption &&
                      'border-input-border bg-card text-text-primary hover:border-primary/70 hover:shadow-glow',
                    isSelected &&
                      'border-primary bg-primary text-white',
                    showCorrect &&
                      'border-green-500 bg-green-500 text-white',
                    showWrong && 'border-red-500 bg-red-500 text-white',
                    selectedOption && !showCorrect && !showWrong && 'border-input-border bg-card text-text-secondary',
                    shakeKey === `mc-${key}` && 'shake'
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dark-bg/40 font-bold">
                    {showCorrect ? (
                      <Check className="h-5 w-5" />
                    ) : showWrong ? (
                      <X className="h-5 w-5" />
                    ) : (
                      key
                    )}
                  </span>
                  <span>{currentMc.options[key]}</span>
                  {floatingXp?.key === `mc-${key}` && (
                    <span className="pointer-events-none absolute right-5 top-2 animate-float-up text-sm font-black text-green-500">
                      +{floatingXp.amount} XP
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <Card className="border border-primary/20 bg-input">
              <p className="mb-2 font-bold text-text-primary">
                {selectedOption === currentMc.correct_answer
                  ? 'Correct!'
                  : `Not quite. The correct answer is ${currentMc.correct_answer}.`}
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                {currentMc.explanation}
              </p>
            </Card>
          )}

          {selectedOption && (
            <p className="text-center text-sm font-semibold text-text-muted">
              {autoAdvancingMc ? 'Moving to the next question...' : 'Nice work.'}
            </p>
          )}
        </motion.div>
        </AnimatePresence>
      )}

      {mode === 'clinical_blanks' && hasStarted && currentBlank && (
        <Card className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Clinical Blanks
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Blank {blankIndex + 1} of {clinicalBlankQuestions.length}
            </p>
          </div>

          <div className="text-xl font-semibold leading-10 text-text-primary">
            {currentBlank.sentence.split(/(\{blank\d+\})/g).map((part, index) => {
              const match = part.match(/\{(blank\d+)\}/);
              if (!match) return <span key={`${part}-${index}`}>{part}</span>;
              const key = match[1];
              const blank = currentBlank.blanks[key];
              const isWrong =
                blankSubmitted && blankAnswers[key] !== blank.correct;
              const isCorrect =
                blankSubmitted && blankAnswers[key] === blank.correct;
              return (
                <select
                  key={key}
                  value={blankAnswers[key] || ''}
                  disabled={blankSubmitted}
                  onChange={(event) =>
                    setBlankAnswers((answers) => ({
                      ...answers,
                      [key]: event.target.value,
                    }))
                  }
                  className={cn(
                    'mx-1 inline-flex rounded-pill border-2 border-primary bg-white px-3 py-1 text-base font-bold text-primary outline-none transition-all focus:ring-4 focus:ring-primary/20',
                    isWrong && 'border-red-500 bg-red-50 text-red-600',
                    isCorrect && 'border-green-500 bg-green-50 text-green-600',
                    shakeKey === key && 'shake'
                  )}
                >
                  <option value="">Select</option>
                  {blank.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              );
            })}
          </div>

          {blankSubmitted && (
            <div className="rounded-card border border-primary/20 bg-input p-4">
              <p className="text-3xl font-black text-primary">{blankScore}%</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {currentBlank.explanation}
              </p>
            </div>
          )}

          {!blankSubmitted ? (
            <Button
              onClick={submitClinicalBlank}
              disabled={
                Object.keys(currentBlank.blanks).some((key) => !blankAnswers[key])
              }
              className="w-full"
            >
              Check My Blanks
            </Button>
          ) : (
            <Button onClick={nextClinicalBlank} className="w-full">
              {blankIndex < clinicalBlankQuestions.length - 1
                ? 'Next Clinical Blank'
                : 'Finish Session'}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
