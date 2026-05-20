'use client';

import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function AnswerInput({
  value,
  onChange,
  onSubmit,
  loading,
  disabled,
}: AnswerInputProps) {
  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        Your answer
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        placeholder="Type your answer here... Use the STAR method for behavioral questions."
        rows={6}
        className={cn(
          'w-full resize-none rounded-card border border-input-border bg-input px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          (disabled || loading) && 'opacity-60 cursor-not-allowed'
        )}
      />
      <Button
        onClick={onSubmit}
        loading={loading}
        disabled={!value.trim() || disabled}
        className="w-full sm:w-auto"
      >
        Submit Answer
      </Button>
    </div>
  );
}
