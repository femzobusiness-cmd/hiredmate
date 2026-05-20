'use client';

import type { SkillWithProgress } from '@/components/skills/SkillCard';
import { CurrentStageWidget } from '@/components/learn/CurrentStageWidget';
import { MockInterviewWidget } from '@/components/dashboard/MockInterviewWidget';
import { VoicePracticeWidget } from '@/components/dashboard/VoicePracticeWidget';
import { QuestWidget } from '@/components/quests/QuestWidget';
import type { NextStageInfo } from '@/lib/learning-path';
import type { QuestWithProgress } from '@/lib/quests';
import Badge from '@/components/ui/Badge';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { PageTransition } from '@/components/ui/PageTransition';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  Flame,
  HeartPulse,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

type DashboardProfile = {
  first_name: string | null;
  specialty: string | null;
  experience_level: string | null;
  hospital_name: string | null;
  job_title: string | null;
  interview_date: string | null;
  rank_title: string;
  rank_level: number;
  total_xp: number;
  current_streak: number;
};

type DashboardSession = {
  id: string;
  title: string;
  score: number | null;
  questions_count: number;
  created_at: string;
};

type DashboardAnswer = {
  id: string;
  session_id: string;
  question: string;
  score: number | null;
  feedback: string | null;
  created_at: string;
};

type CommandCenterDashboardProps = {
  profile: DashboardProfile | null;
  sessions: DashboardSession[];
  answers: DashboardAnswer[];
  skills: SkillWithProgress[];
  firstName: string;
  dailyQuests?: QuestWithProgress[];
  nextStage?: NextStageInfo | null;
  stagesCompletedCount?: number;
  totalStages?: number;
};

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 };

export function CommandCenterDashboard({
  profile,
  sessions,
  answers,
  skills,
  firstName,
  dailyQuests = [],
  nextStage = null,
  stagesCompletedCount = 0,
  totalStages = 26,
}: CommandCenterDashboardProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  const scoredAnswers = useMemo(
    () => answers.filter((answer) => answer.score != null),
    [answers]
  );
  const scores = scoredAnswers.map((answer) => answer.score as number);
  const totalSessions = sessions.length;
  const avgScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const streak = profile?.current_streak || 0;
  const readinessScore = Math.min(
    100,
    Math.round(
      avgScore * 0.5 +
        (Math.min(totalSessions, 20) / 20) * 30 +
        (Math.min(streak, 7) / 7) * 20
    )
  );

  const skillByName = useMemo(
    () =>
      skills.reduce<Record<string, SkillWithProgress>>((current, skill) => {
        current[skill.name] = skill;
        return current;
      }, {}),
    [skills]
  );
  const weakestSkill =
    skills
      .filter((skill) => skill.sessionsCount > 0 && skill.avgScore != null)
      .sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0))[0]?.name ||
    'Patient Prioritization';

  const hospital = profile?.hospital_name?.trim() || 'your target hospital';
  const specialty = profile?.specialty?.trim() || 'nursing';
  const jobTitle = profile?.job_title?.trim() || `${specialty} nurse`;
  const daysUntilInterview = profile?.interview_date
    ? daysBetween(new Date(profile.interview_date), new Date())
    : null;

  const motivationalMessages = useMemo(
    () => [
      readinessScore >= 80
        ? `You're interview-ready and trending above most ${specialty} nurses on HiredMate`
        : `You're ${Math.max(0, 80 - readinessScore)} points from the green readiness zone`,
      `${Math.max(1, Math.ceil((100 - readinessScore) / 8))} more focused sessions can push your readiness higher`,
      `Your strongest area: ${getStrongestSkill(skills)}`,
      daysUntilInterview != null && daysUntilInterview >= 0
        ? `${hospital} interview in ${daysUntilInterview} day${daysUntilInterview === 1 ? '' : 's'}`
        : `Set your interview date to unlock a live prep countdown`,
    ],
    [daysUntilInterview, hospital, readinessScore, skills, specialty]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % motivationalMessages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [motivationalMessages.length]);

  const recentSessions = sessions.slice(0, 5).map((session, index, list) => {
    const score = getSessionScore(session, answers);
    const previousScore = getSessionScore(list[index + 1], answers);
    return { ...session, displayScore: score, previousScore };
  });

  const todaySessions = sessions.filter((session) => isToday(session.created_at)).length;
  const challengeTotal = 5;
  const challengeProgress = Math.min(challengeTotal, todaySessions);
  const preparationScore = Math.round((readinessScore + avgScore) / 2);

  return (
    <PageTransition>
      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(124,92,191,0.16)] backdrop-blur md:p-8"
        >
          <FloatingParticles />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,92,191,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,198,178,0.18),transparent_32%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.08 }}
                className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
              >
                <Sparkles className="h-4 w-4" />
                Mission Control
              </motion.p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-text-primary md:text-6xl">
                Ready to ace your interview, {firstName}? 🩺
              </h1>
              <div className="mt-4 h-8 overflow-hidden text-lg font-medium text-text-secondary">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                  >
                    {motivationalMessages[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <GlowRankBadge
                  title={profile?.rank_title || 'Student Nurse'}
                  level={profile?.rank_level || 1}
                />
                <HeroStreakBadge streak={streak} />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/practice">
                  <motion.span
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#9B7FD4] px-6 py-3 font-bold text-white shadow-[0_16px_40px_rgba(124,92,191,0.35)]"
                  >
                    Start Today&apos;s Practice
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.span>
                </Link>
                <div className="text-sm font-semibold text-text-secondary">
                  {totalSessions} sessions completed · {profile?.total_xp || 0} XP earned
                </div>
              </div>
            </div>

            <ReadinessRing score={readinessScore} />
          </div>
        </motion.section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            icon={BookOpen}
            label="Total Sessions"
            value={totalSessions}
            suffix=""
            iconClassName="from-primary to-[#9B7FD4]"
          />
          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={avgScore}
            suffix="%"
            valueClassName={scoreTextColor(avgScore)}
            iconClassName="from-secondary to-primary"
          />
          <StatCard
            icon={Star}
            label="Best Score"
            value={bestScore}
            suffix="%"
            iconClassName="from-gold to-orange-500"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={streak}
            suffix=" days"
            prefix="🔥 "
            iconClassName="from-orange-400 to-red-500"
          />
        </motion.div>

        <ConfidenceCard
          score={readinessScore}
          weakestSkill={weakestSkill}
          skills={[
            skillByName['Clinical Judgment'],
            skillByName.Communication,
            skillByName['Patient Prioritization'],
          ]}
        />

        {dailyQuests.length > 0 && <QuestWidget quests={dailyQuests} />}

        <MockInterviewWidget />

        <VoicePracticeWidget />

        {nextStage && (
          <CurrentStageWidget
            nextStage={nextStage}
            completedCount={stagesCompletedCount}
            totalStages={totalStages}
          />
        )}

        <CountdownCard
          hospital={hospital}
          jobTitle={jobTitle}
          interviewDate={profile?.interview_date}
          preparationScore={preparationScore}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.14, delayChildren: 0.8 } },
          }}
          className="grid gap-4 xl:grid-cols-3"
        >
          <TodayChallengeCard progress={challengeProgress} total={challengeTotal} specialty={specialty} />
          <WeakSpotsCard weakestSkill={weakestSkill} />
          <SalaryIntelCard jobTitle={jobTitle} readinessScore={readinessScore} />
        </motion.div>

        <SkillHeatmap skills={skills} />

        <MotivationalInsightCard
          readinessScore={readinessScore}
          weakestSkill={weakestSkill}
          avgScore={avgScore}
        />

        <RecentSessions sessions={recentSessions} />
      </div>
    </PageTransition>
  );
}

function useCountUp(end: number, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = window.setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        window.clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [end, duration]);

  return count;
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  prefix = '',
  iconClassName,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  iconClassName: string;
  valueClassName?: string;
}) {
  const count = useCountUp(value);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: spring },
      }}
      whileHover={{
        y: -8,
        boxShadow: '0 24px 56px rgba(124,92,191,0.2)',
      }}
      className="rounded-card border border-white/70 bg-white p-6 shadow-card"
    >
      <div className={cn('mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', iconClassName)}>
        <Icon className="h-6 w-6" />
      </div>
      <p className={cn('text-4xl font-black tracking-tight text-text-primary', valueClassName)}>
        {prefix}
        {count}
        {suffix}
      </p>
      <p className="mt-1 text-sm font-semibold text-text-secondary">{label}</p>
    </motion.div>
  );
}

function ReadinessRing({ score }: { score: number }) {
  const count = useCountUp(score, 1200);
  const color = score > 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay: 0.2 }}
      className="mx-auto flex w-full max-w-[300px] flex-col items-center rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_18px_50px_rgba(124,92,191,0.18)] backdrop-blur"
    >
      <div className="relative h-56 w-56">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(124,92,191,0.12)"
            strokeWidth="10"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="10"
            pathLength={1}
            strokeDasharray="1"
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 1 - score / 100 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black text-text-primary">{count}%</span>
          <span className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
            Interview Ready
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-sm font-medium text-text-secondary">
        Powered by score, completed sessions, and streak consistency.
      </p>
    </motion.div>
  );
}

function ConfidenceCard({
  score,
  weakestSkill,
  skills: confidenceSkills,
}: {
  score: number;
  weakestSkill: string;
  skills: (SkillWithProgress | undefined)[];
}) {
  const count = useCountUp(score, 1000);

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.6 }}
      className="overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-[#8F6FD0] to-[#4B2E83] p-6 text-white shadow-[0_24px_70px_rgba(124,92,191,0.28)] md:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
            AI Confidence Score
          </p>
          <h2 className="text-3xl font-black">Based on your last 10 practice sessions</h2>
          <div className="mt-6 text-5xl font-black">{count}% Confident</div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.75 }}
              className="h-full rounded-full bg-gradient-to-r from-white to-secondary"
            />
          </div>
        </div>

        <div className="space-y-4">
          {confidenceSkills.map((skill, index) => (
            <MiniSkillBar
              key={skill?.name || index}
              label={skill?.name || ['Clinical Judgment', 'Communication', 'Patient Prioritization'][index]}
              score={skill?.avgScore || 0}
              delay={0.8 + index * 0.12}
            />
          ))}
          <p className="rounded-2xl bg-white/15 p-4 text-sm italic leading-6 text-white">
            Your weakest area is {weakestSkill}. We recommend focusing on time-sensitive
            scenarios before your next interview.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function MiniSkillBar({
  label,
  score,
  delay,
}: {
  label: string;
  score: number;
  delay: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay }}
          className="h-full rounded-full bg-white"
        />
      </div>
    </div>
  );
}

function CountdownCard({
  hospital,
  jobTitle,
  interviewDate,
  preparationScore,
}: {
  hospital: string;
  jobTitle: string;
  interviewDate: string | null | undefined;
  preparationScore: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.7 }}
      className="overflow-hidden rounded-[28px] bg-gradient-to-r from-primary via-[#7F6BD6] to-secondary bg-[length:200%_200%] p-6 text-white shadow-[0_24px_70px_rgba(0,198,178,0.22)] md:p-8"
    >
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="grid gap-8 lg:grid-cols-[1fr_1.2fr_0.8fr] lg:items-center"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Calendar className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black">
              {interviewDate ? `Interview at ${hospital}` : 'Interview date not set'}
            </h2>
            <p className="mt-1 text-white/80">
              {interviewDate
                ? `${jobTitle} · ${formatDate(interviewDate)}`
                : 'Add your target date in Settings to start the live countdown.'}
            </p>
          </div>
        </div>

        <CountdownSection interviewDate={interviewDate} />

        <div className="flex items-center justify-center gap-4 lg:justify-end">
          <SmallProgressRing score={preparationScore} />
          <div>
            <p className="text-lg font-black">🎯 Preparation Score</p>
            <p className="text-3xl font-black">{preparationScore}%</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

function CountdownSection({
  interviewDate,
}: {
  interviewDate: string | null | undefined;
}) {
  const [mounted, setMounted] = useState(false);
  const countdown = useCountdown(interviewDate);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-24 animate-pulse rounded-xl bg-purple-100" />;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <CountdownUnit label="Days" value={countdown.days} />
      <CountdownUnit label="Hours" value={countdown.hours} />
      <CountdownUnit label="Mins" value={countdown.minutes} />
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/20 p-4 text-center shadow-inner backdrop-blur">
      <div className="text-4xl font-black tabular-nums" suppressHydrationWarning>
        {value}
      </div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/75">
        {label}
      </div>
    </div>
  );
}

function TodayChallengeCard({
  progress,
  total,
  specialty,
}: {
  progress: number;
  total: number;
  specialty: string;
}) {
  return (
    <QuickActionShell className="bg-gradient-to-br from-primary to-[#4B2E83] text-white">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
          <Zap className="h-6 w-6" />
        </div>
        <Badge variant="teal">Today</Badge>
      </div>
      <div>
        <h3 className="text-2xl font-black">Today&apos;s Challenge</h3>
        <p className="mt-2 text-white/80">Complete {total} {specialty} scenarios today</p>
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm font-bold">
          <span>{progress} of {total} completed</span>
          <span>{Math.round((progress / total) * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progress / total) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="h-full rounded-full bg-white"
          />
        </div>
      </div>
      <Link href="/practice">
        <motion.span
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.7, repeat: Infinity }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-primary"
        >
          Continue Challenge
          <ArrowUpRight className="h-4 w-4" />
        </motion.span>
      </Link>
    </QuickActionShell>
  );
}

function WeakSpotsCard({ weakestSkill }: { weakestSkill: string }) {
  return (
    <QuickActionShell className="border border-purple-50 bg-white text-text-primary">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Target className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
          Weak Spots
        </p>
        <h3 className="mt-2 text-3xl font-black">{weakestSkill}</h3>
        <p className="mt-2 text-text-secondary">Your weakest area this week</p>
      </div>
      <MiniHeatmap />
      <Link href="/practice" className="font-bold text-primary">
        Practice this now <ArrowUpRight className="inline h-4 w-4" />
      </Link>
    </QuickActionShell>
  );
}

function SalaryIntelCard({
  jobTitle,
  readinessScore,
}: {
  jobTitle: string;
  readinessScore: number;
}) {
  const power =
    readinessScore >= 80 ? 'Very strong' : readinessScore >= 60 ? 'Strong' : 'Building';

  return (
    <QuickActionShell className="border border-teal-100 bg-white text-text-primary">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
        <DollarSign className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary">
          Salary Intel
        </p>
        <h3 className="mt-2 text-2xl font-black">{jobTitle}</h3>
        <p className="mt-2 text-text-secondary">
          Your negotiation power: <span className="font-black text-text-primary">{power}</span>
        </p>
      </div>
      <div className="rounded-2xl border border-secondary/15 bg-secondary/5 p-4">
        <p className="text-sm font-semibold text-text-secondary">
          Use your profile to generate a role-specific script and target range.
        </p>
      </div>
      <Link href="/salary-prep" className="font-bold text-secondary">
        Generate Script <ArrowUpRight className="inline h-4 w-4" />
      </Link>
    </QuickActionShell>
  );
}

function QuickActionShell({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: spring },
      }}
      whileHover={{ y: -6, boxShadow: '0 24px 56px rgba(124,92,191,0.16)' }}
      className={cn('flex min-h-[280px] flex-col justify-between rounded-[28px] p-6 shadow-card', className)}
    >
      {children}
    </motion.div>
  );
}

function SkillHeatmap({ skills: skillMetrics }: { skills: SkillWithProgress[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 1 }}
      className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card md:p-8"
    >
      <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black text-text-primary">Your Skill Map</h2>
          <p className="mt-1 text-text-secondary">
            Hover to see details ·{' '}
            <Link href="/skills" className="font-bold text-primary">
              Open Skill Tree →
            </Link>
          </p>
        </div>
        <HeartPulse className="h-8 w-8 text-primary" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {skillMetrics.map((skill, index) => (
          <motion.div
            key={skill.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 1 + index * 0.04 }}
            whileHover={{ scale: 1.1, y: -4 }}
            className={cn(
              'group relative flex shrink-0 flex-col items-center justify-center rounded-full p-3 text-center text-[10px] font-black shadow-lg',
              skillBubbleColor(skill.avgScore, skill.sessionsCount)
            )}
            style={{
              width: `${skill.sessionsCount ? Math.min(148, 88 + skill.level * 10) : 88}px`,
              height: `${skill.sessionsCount ? Math.min(148, 88 + skill.level * 10) : 88}px`,
              backgroundColor: skill.sessionsCount ? skill.lightColor : undefined,
              color: skill.sessionsCount ? skill.color : undefined,
              borderWidth: skill.level >= 10 ? 3 : 1,
              borderColor: skill.color,
            }}
          >
            <span className="text-lg">{skill.icon}</span>
            <span className="mt-1 leading-tight">{skill.name}</span>
            <div className="pointer-events-none absolute -top-14 left-1/2 z-20 w-44 -translate-x-1/2 rounded-2xl bg-text-primary px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {skill.sessionsCount === 0
                ? 'Not started'
                : `Level ${skill.level} · ${skill.avgScore}% · ${skill.sessionsCount} sessions`}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function MotivationalInsightCard({
  readinessScore,
  weakestSkill,
  avgScore,
}: {
  readinessScore: number;
  weakestSkill: string;
  avgScore: number;
}) {
  const tips = [
    `${weakestSkill} practice is your highest-leverage move for the next session.`,
    `Your consistency puts your readiness score at ${readinessScore}%. Keep the streak alive today.`,
    avgScore
      ? `Your current answer average is ${avgScore}%. One focused review session can lift the next attempt.`
      : 'Complete your first scored session to unlock personalized trend insights.',
  ];
  const dayIndex = new Date().getDate() % tips.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 1.1 }}
      className="rounded-[28px] border border-purple-50 bg-white p-6 shadow-card"
    >
      <div className="border-l-4 border-primary pl-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
          💡 Today&apos;s Focus
        </p>
        <p className="mt-2 text-xl font-bold leading-8 text-text-primary">{tips[dayIndex]}</p>
      </div>
    </motion.section>
  );
}

function RecentSessions({
  sessions,
}: {
  sessions: (DashboardSession & {
    displayScore: number | null;
    previousScore: number | null;
  })[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 1.2 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-black text-text-primary">Recent Sessions</h2>
      {sessions.length > 0 ? (
        <div className="overflow-hidden rounded-[28px] border border-purple-50 bg-white shadow-card">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 1.2 + index * 0.08 }}
            >
              <Link
                href={`/session/${session.id}`}
                className="grid gap-4 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-primary/5 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <SessionTypeIcon title={session.title} />
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="teal">{sessionSpecialty(session.title)}</Badge>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                        {relativeTime(session.created_at)}
                      </span>
                    </div>
                    <p className="font-bold text-text-primary">{session.title}</p>
                    <p className="text-sm text-text-secondary">
                      {session.questions_count} questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:justify-end">
                  <MiniScoreRing score={session.displayScore} />
                  <TrendIndicator
                    score={session.displayScore}
                    previousScore={session.previousScore}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-primary/25 bg-white p-10 text-center shadow-card">
          <p className="mb-4 text-text-secondary">No practice sessions yet</p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white"
          >
            Start your first session
            <Play className="h-4 w-4" />
          </Link>
        </div>
      )}
    </motion.section>
  );
}

function GlowRankBadge({ title, level }: { title: string; level: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-black text-white shadow-[0_0_28px_rgba(124,92,191,0.45)]"
    >
      <ShieldCheck className="h-4 w-4" />
      Level {level} · {title}
    </motion.div>
  );
}

function HeroStreakBadge({ streak }: { streak: number }) {
  return (
    <motion.div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-4 py-2 text-sm font-black text-white shadow-lg">
      <motion.span
        animate={{ scale: [1, 1.2, 1], rotate: [-6, 8, -6] }}
        transition={{ duration: 1.3, repeat: Infinity }}
      >
        🔥
      </motion.span>
      {streak} day streak
    </motion.div>
  );
}

function MiniHeatmap() {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 28 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 rounded-[5px]',
            index % 5 === 0
              ? 'bg-red-300'
              : index % 3 === 0
                ? 'bg-gold/70'
                : 'bg-primary/25'
          )}
        />
      ))}
    </div>
  );
}

function SmallProgressRing({ score }: { score: number }) {
  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
        <circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
        <motion.circle
          cx="21"
          cy="21"
          r="16"
          fill="none"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="5"
          pathLength={1}
          strokeDasharray="1"
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 1 - score / 100 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
      </svg>
      <CheckCircle2 className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

function MiniScoreRing({ score }: { score: number | null }) {
  const safeScore = score || 0;
  return (
    <div className="relative h-10 w-10">
      <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
        <circle cx="21" cy="21" r="16" fill="none" stroke="#EDE9F7" strokeWidth="5" />
        <motion.circle
          cx="21"
          cy="21"
          r="16"
          fill="none"
          stroke={safeScore >= 80 ? '#10B981' : safeScore >= 60 ? '#F59E0B' : '#EF4444'}
          strokeLinecap="round"
          strokeWidth="5"
          pathLength={1}
          strokeDasharray="1"
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 1 - safeScore / 100 }}
          transition={{ duration: 0.8 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-text-primary">
        {score == null ? '--' : Math.round(score)}
      </span>
    </div>
  );
}

function TrendIndicator({
  score,
  previousScore,
}: {
  score: number | null;
  previousScore: number | null;
}) {
  if (score == null || previousScore == null || score === previousScore) {
    return <span className="text-sm font-bold text-text-muted">Stable</span>;
  }

  const improved = score > previousScore;
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-black', improved ? 'text-success' : 'text-error')}>
      {improved ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      {improved ? 'Improved' : 'Declined'}
    </span>
  );
}

function SessionTypeIcon({ title }: { title: string }) {
  const lower = title.toLowerCase();
  if (lower.includes('quick') || lower.includes('multiple')) return <Zap className="h-5 w-5" />;
  if (lower.includes('blank')) return <Clock3 className="h-5 w-5" />;
  return <BookOpen className="h-5 w-5" />;
}

function useCountdown(interviewDate: string | null | undefined) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!interviewDate) return { days: 0, hours: 0, minutes: 0 };

  const difference = Math.max(0, new Date(interviewDate).getTime() - now.getTime());
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);

  return { days, hours, minutes };
}

function getStrongestSkill(skillMetrics: SkillWithProgress[]) {
  return (
    skillMetrics
      .filter((skill) => skill.avgScore != null && skill.sessionsCount > 0)
      .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))[0]?.name ||
    'Clinical Judgment'
  );
}

function getSessionScore(
  session: DashboardSession | undefined,
  answers: DashboardAnswer[]
) {
  if (!session) return null;
  if (session.score != null) return Math.round(session.score);

  const sessionScores = answers
    .filter((answer) => answer.session_id === session.id && answer.score != null)
    .map((answer) => answer.score as number);

  return sessionScores.length
    ? Math.round(sessionScores.reduce((sum, score) => sum + score, 0) / sessionScores.length)
    : null;
}

function scoreTextColor(score: number) {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-gold';
  return 'text-error';
}

function skillBubbleColor(score: number | null, sessionsCount: number) {
  if (sessionsCount === 0) return 'bg-gray-100 text-gray-500 border border-gray-200';
  if (score == null) return 'bg-gray-100 text-gray-500';
  if (score > 80) return 'bg-emerald-100 text-emerald-700';
  if (score >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function sessionSpecialty(title: string) {
  const lower = title.toLowerCase();
  const specialty = ['ICU', 'ER', 'Med-Surg', 'Oncology', 'Pediatrics', 'L&D'].find((item) =>
    lower.includes(item.toLowerCase())
  );
  return specialty || 'Practice';
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}

function isToday(date: string) {
  const value = new Date(date);
  const today = new Date();
  return (
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
}

function daysBetween(later: Date, earlier: Date) {
  return Math.ceil((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
