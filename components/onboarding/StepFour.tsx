'use client';

import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { BiggestFear } from '@/lib/types';

const FEARS: BiggestFear[] = [
  'Clinical scenario questions',
  'Behavioral questions',
  'Salary negotiation',
  'Explaining resume gaps',
  'New grad with no experience',
  'Switching specialties',
];

interface StepFourProps {
  fears: BiggestFear[];
  loading: boolean;
  onToggleFear: (fear: BiggestFear) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function StepFour({
  fears,
  loading,
  onToggleFear,
  onSubmit,
  onBack,
}: StepFourProps) {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        What worries you most?
      </h2>
      <p className="mb-8 text-text-secondary">Select all that apply</p>

      <div className="mb-10 flex flex-wrap gap-2">
        {FEARS.map((fear) => {
          const selected = fears.includes(fear);
          return (
            <button
              key={fear}
              type="button"
              onClick={() => onToggleFear(fear)}
              className={cn(
                'rounded-pill border-2 px-4 py-2.5 text-sm font-medium transition-all',
                selected
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/50 bg-card text-primary hover:bg-input'
              )}
            >
              {fear}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={onSubmit}
          loading={loading}
          disabled={fears.length === 0}
          className="flex-1"
        >
          Generate My Prep
        </Button>
      </div>
    </div>
  );
}
