'use client';

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sample_answer: string;
}

interface FeedbackPanelProps {
  feedback: Feedback;
}

export default function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const scoreVariant =
    feedback.score >= 80 ? 'success' : feedback.score >= 60 ? 'warning' : 'danger';

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm text-body-text">Your score</p>
          <p className="text-3xl font-bold text-dark-text">{feedback.score}%</p>
        </div>
        <Badge variant={scoreVariant} className="text-base px-4 py-2">
          {feedback.score >= 80
            ? 'Excellent'
            : feedback.score >= 60
              ? 'Good'
              : 'Keep practicing'}
        </Badge>
      </Card>

      {feedback.strengths.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-dark-text">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-body-text">
                <span className="text-green-500">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {feedback.improvements.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-dark-text">Areas to improve</h3>
          </div>
          <ul className="space-y-2">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-body-text">
                <span className="text-primary">→</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {feedback.sample_answer && (
        <Card className="bg-light-bg border border-primary/10">
          <h3 className="mb-2 font-semibold text-dark-text">Sample strong answer</h3>
          <p className="text-sm leading-relaxed text-body-text">
            {feedback.sample_answer}
          </p>
        </Card>
      )}
    </div>
  );
}
