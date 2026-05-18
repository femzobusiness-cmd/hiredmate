import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export default async function SessionPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: practiceSession } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session!.user.id)
    .single();

  if (!practiceSession) notFound();

  const { data: answers } = await supabase
    .from('session_answers')
    .select('*')
    .eq('session_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">
            {practiceSession.title}
          </h1>
          <p className="text-body-text">
            {practiceSession.questions_count} questions ·{' '}
            {new Date(practiceSession.created_at).toLocaleDateString()}
          </p>
        </div>
        {practiceSession.score != null && (
          <Badge
            variant={practiceSession.score >= 70 ? 'success' : 'warning'}
            className="text-base px-4 py-2"
          >
            {Math.round(practiceSession.score)}% avg
          </Badge>
        )}
      </div>

      {answers && answers.length > 0 ? (
        <div className="space-y-4">
          {answers.map((a, i) => {
            const feedback = a.feedback ? JSON.parse(a.feedback) : null;
            return (
              <Card key={a.id}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    Q{i + 1}
                  </span>
                  {a.score != null && (
                    <Badge variant={a.score >= 70 ? 'success' : 'warning'}>
                      {Math.round(a.score)}%
                    </Badge>
                  )}
                </div>
                <p className="mb-3 font-medium text-dark-text">{a.question}</p>
                <p className="mb-3 text-sm text-body-text">{a.answer}</p>
                {feedback?.strengths?.[0] && (
                  <div className="flex gap-2 rounded-card bg-light-bg p-3 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-body-text">{feedback.strengths[0]}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-body-text">No answers recorded for this session yet.</p>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href="/practice" className="flex-1">
          <Button className="w-full">Practice Again</Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
