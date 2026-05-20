'use client';

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [displayScore, setDisplayScore] = useState(0);
  const scoreVariant =
    feedback.score >= 80 ? 'success' : feedback.score >= 60 ? 'warning' : 'danger';
  const scoreColor =
    feedback.score >= 80
      ? 'text-green-400'
      : feedback.score >= 60
        ? 'text-gold'
        : 'text-red-400';

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    let frame = 0;

    const animate = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      setDisplayScore(Math.round(feedback.score * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [feedback.score]);

  const displayColor =
    displayScore >= 80
      ? 'text-green-400'
      : displayScore >= 60
        ? 'text-gold'
        : 'text-red-400';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
      >
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Your score</p>
          <p className={`text-5xl font-bold transition-colors ${displayColor}`}>
            {displayScore}%
          </p>
        </div>
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0 h-24 w-24 -rotate-90" viewBox="0 0 84 84">
            <circle
              cx="42"
              cy="42"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary/15"
            />
            <circle
              cx="42"
              cy="42"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={feedback.score >= 70 ? 'text-primary' : 'text-red-500'}
              style={{ transition: 'stroke-dashoffset 120ms linear' }}
            />
          </svg>
          <span className={`relative text-lg font-bold ${scoreColor}`}>
            {displayScore}
          </span>
        </div>
        <Badge variant={scoreVariant} className="text-base px-4 py-2">
          {feedback.score >= 80
            ? 'Excellent'
            : feedback.score >= 60
              ? 'Good'
              : 'Keep practicing'}
        </Badge>
      </Card>
      </motion.div>

      {feedback.strengths.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h3 className="font-semibold text-text-primary">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex gap-2 text-sm text-text-secondary"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                {s}
              </motion.li>
            ))}
          </ul>
        </Card>
      )}

      {feedback.improvements.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gold" />
            <h3 className="font-semibold text-text-primary">Areas to improve</h3>
          </div>
          <ul className="space-y-2">
            {feedback.improvements.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex gap-2 text-sm text-text-secondary"
              >
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {s}
              </motion.li>
            ))}
          </ul>
        </Card>
      )}

      {feedback.sample_answer && (
        <Card className="border border-border bg-input">
          <h3 className="mb-2 font-semibold text-text-primary">Model answer</h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            {feedback.sample_answer}
          </p>
        </Card>
      )}
    </div>
  );
}
