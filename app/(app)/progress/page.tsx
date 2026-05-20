import ScoreTrendChart from '@/components/progress/ScoreTrendChart';
import AchievementGrid from '@/components/gamification/AchievementGrid';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cn } from '@/utils/cn';
import {
  BookOpen,
  ChevronRight,
  Star,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

function scoreColor(score: number) {
  if (score > 80) return 'text-green-400';
  if (score >= 60) return 'text-gold';
  return 'text-red-400';
}

function scoreBadgeVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score > 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}

export default async function ProgressPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: practiceSessions } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: achievements } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', session!.user.id);

  const sessionIds = practiceSessions?.map((item) => item.id) || [];

  const { data: answers } = sessionIds.length
    ? await supabase
        .from('session_answers')
        .select('*')
        .in('session_id', sessionIds)
        .not('score', 'is', null)
    : { data: [] };

  const scores = answers?.map((answer) => answer.score).filter((score): score is number => score != null) || [];
  const totalSessions = practiceSessions?.length || 0;
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  const bestScore = scores.length ? Math.round(Math.max(...scores)) : 0;

  const chronologicalSessions = [...(practiceSessions || [])].reverse();
  const chartData = chronologicalSessions
    .map((practiceSession) => {
      const sessionScores =
        answers
          ?.filter((answer) => answer.session_id === practiceSession.id && answer.score != null)
          .map((answer) => answer.score as number) || [];
      const score = sessionScores.length
        ? Math.round(
            sessionScores.reduce((sum, item) => sum + item, 0) /
              sessionScores.length
          )
        : practiceSession.score;

      if (score == null) return null;

      return {
        date: new Date(practiceSession.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        score: Math.round(score),
      };
    })
    .filter((item): item is { date: string; score: number } => item != null);

  return (
    <div className="space-y-8 bg-dark-bg text-text-primary">
      <header className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-card border border-primary/30 bg-primary/10">
          <TrendingUp className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">
            My Progress
          </h1>
          <p className="mt-2 text-text-secondary">
            Track your improvement over time
          </p>
        </div>
      </header>

      {totalSessions === 0 ? (
        <Card className="flex min-h-[520px] flex-col items-center justify-center text-center">
          <BookOpen className="mb-5 h-16 w-16 text-text-muted" />
          <h2 className="text-2xl font-bold text-text-primary">
            No practice sessions yet
          </h2>
          <p className="mt-3 max-w-md text-text-secondary">
            Start practicing to track your progress over time
          </p>
          <Link href="/practice" className="mt-8">
            <Button size="lg">Start Your First Session</Button>
          </Link>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <div className="mb-5 flex items-center justify-between">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Total
                </span>
              </div>
              <p className="text-4xl font-bold text-text-primary">
                {totalSessions}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Sessions completed
              </p>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between">
                <TrendingUp className="h-6 w-6 text-secondary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Average
                </span>
              </div>
              <p className={cn('text-4xl font-bold', scoreColor(averageScore))}>
                {averageScore}%
              </p>
              <p className="mt-2 text-sm text-text-secondary">Average score</p>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between">
                <Star className="h-6 w-6 text-gold" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Best
                </span>
              </div>
              <p className="text-4xl font-bold text-text-primary">{bestScore}%</p>
              <p className="mt-2 text-sm text-text-secondary">Personal best</p>
            </Card>
          </section>

          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary">Score Trend</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Track how your interview answers improve across sessions.
              </p>
            </div>

            {chartData.length >= 2 ? (
              <ScoreTrendChart data={chartData} />
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-card border border-dashed border-input-border bg-input text-center">
                <BookOpen className="mb-4 h-12 w-12 text-text-muted" />
                <p className="text-lg font-semibold text-text-primary">
                  Complete more sessions to see your score trend
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                Achievement Badges
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Earn badges as you build momentum and sharpen your answers.
              </p>
            </div>
            <AchievementGrid
              earnedKeys={achievements?.map((item) => item.achievement_key) || []}
            />
          </Card>

          <section>
            <h2 className="mb-4 text-xl font-bold text-text-primary">
              Recent Sessions
            </h2>
            <div className="space-y-3">
              {practiceSessions?.map((practiceSession) => {
                const sessionScores =
                  answers
                    ?.filter((answer) => answer.session_id === practiceSession.id && answer.score != null)
                    .map((answer) => answer.score as number) || [];
                const score = sessionScores.length
                  ? Math.round(
                      sessionScores.reduce((sum, item) => sum + item, 0) /
                        sessionScores.length
                    )
                  : practiceSession.score;
                const displayScore = score == null ? 0 : Math.round(score);
                const sessionType =
                  practiceSession.title.toLowerCase().includes('quick') ||
                  practiceSession.title.toLowerCase().includes('multiple')
                    ? 'Multiple Choice'
                    : 'Written';

                return (
                  <Link
                    key={practiceSession.id}
                    href={`/session/${practiceSession.id}`}
                  >
                    <Card className="flex flex-col gap-4 transition-colors hover:border-primary/60 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2 sm:min-w-[220px]">
                        <Badge variant="outline">Practice</Badge>
                        <span className="rounded-pill border border-input-border bg-input px-3 py-1 text-xs font-medium text-text-secondary">
                          {sessionType}
                        </span>
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-text-primary">
                          {practiceSession.title}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {new Date(
                            practiceSession.created_at
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          · {practiceSession.questions_count} questions
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        {score == null ? (
                          <span className="text-sm font-semibold text-text-muted">
                            In progress
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'text-2xl font-bold',
                              scoreColor(displayScore)
                            )}
                          >
                            {displayScore}%
                          </span>
                        )}
                        {score != null && (
                          <Badge variant={scoreBadgeVariant(displayScore)}>
                            Score
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-text-muted" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
