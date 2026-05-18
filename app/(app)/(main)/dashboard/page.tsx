import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { differenceInDays, formatDate } from '@/lib/dates';
import Link from 'next/link';
import { Calendar, TrendingUp, Target, Play } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session!.user.id)
    .maybeSingle();

  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.first_name?.trim() || null;
  const greetingHeading = firstName
    ? `${greeting}, ${firstName} 👋`
    : `${greeting} 👋`;

  const daysUntilInterview = profile?.interview_date
    ? differenceInDays(new Date(profile.interview_date), new Date())
    : null;

  const totalSessions = sessions?.length || 0;
  const scores = sessions?.filter((s) => s.score != null).map((s) => s.score!) || [];
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const improvement =
    scores.length >= 2
      ? Math.round(((scores[0] - scores[scores.length - 1]) / scores[scores.length - 1]) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">{greetingHeading}</h1>
        {profile?.job_title && (
          <p className="mt-1 text-body-text">
            Preparing for {profile.job_title}
            {profile.hospital_name ? ` at ${profile.hospital_name}` : ''}
          </p>
        )}
      </div>

      {daysUntilInterview != null && daysUntilInterview >= 0 && (
        <Card variant="gradient" className="flex items-center gap-4">
          <Calendar className="h-8 w-8 shrink-0 opacity-90" />
          <div>
            <p className="font-semibold text-lg">
              Your interview is in {daysUntilInterview} day
              {daysUntilInterview !== 1 ? 's' : ''}. Let&apos;s get you ready.
            </p>
            {profile?.interview_date && (
              <p className="mt-1 text-sm text-white/80">
                Target date: {formatDate(profile.interview_date)}
              </p>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/practice" className="group">
          <Card
            variant="gradient"
            className="flex h-full flex-col justify-between transition-transform group-hover:scale-[1.02]"
          >
            <div>
              <Play className="mb-4 h-8 w-8" />
              <h3 className="text-lg font-bold">Start Practice Session</h3>
              <p className="mt-2 text-sm text-white/80">
                AI-powered questions tailored to your specialty
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-semibold">
              Begin →
            </span>
          </Card>
        </Link>

        <Link href="/practice?tab=history">
          <Card variant="bordered" className="flex h-full flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <Target className="mb-4 h-8 w-8 text-primary" />
              <h3 className="text-lg font-bold text-dark-text">Review Past Sessions</h3>
              <p className="mt-2 text-sm text-body-text">
                See your answers and feedback from previous practice
              </p>
            </div>
            <span className="mt-4 text-sm font-semibold text-primary">View history →</span>
          </Card>
        </Link>

        <Link href="/dashboard#salary">
          <Card variant="bordered" className="flex h-full flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <TrendingUp className="mb-4 h-8 w-8 text-primary" />
              <h3 className="text-lg font-bold text-dark-text">Salary Prep</h3>
              <p className="mt-2 text-sm text-body-text">
                Scripts and strategies for negotiating your offer
              </p>
            </div>
            <span className="mt-4 text-sm font-semibold text-primary">Explore →</span>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary">{totalSessions}</p>
          <p className="mt-1 text-sm text-body-text">Total sessions</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary">{avgScore}%</p>
          <p className="mt-1 text-sm text-body-text">Average score</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary">
            {improvement > 0 ? '+' : ''}
            {improvement}%
          </p>
          <p className="mt-1 text-sm text-body-text">Improvement</p>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-dark-text">Recent sessions</h2>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link key={session.id} href={`/session/${session.id}`}>
                <Card className="flex items-center justify-between transition-shadow hover:shadow-lg">
                  <div>
                    <p className="font-semibold text-dark-text">{session.title}</p>
                    <p className="text-sm text-body-text">
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {session.questions_count} questions
                    </p>
                  </div>
                  {session.score != null && (
                    <Badge variant={session.score >= 70 ? 'success' : 'warning'}>
                      {Math.round(session.score)}%
                    </Badge>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-body-text mb-4">No practice sessions yet</p>
            <Link href="/practice">
              <Button>Start your first session</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
