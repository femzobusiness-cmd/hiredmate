'use client';

import Button from '@/components/ui/Button';
import { Check, Stethoscope } from 'lucide-react';

interface StepOneProps {
  onNext: () => void;
}

export default function StepOne({ onNext }: StepOneProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 animate-bounce-soft">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-card border border-primary/30 bg-primary/10">
          <Stethoscope className="h-16 w-16 text-primary" />
          <Check className="absolute right-6 top-6 h-6 w-6 rounded-full bg-secondary p-1 text-dark-bg" />
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-text-primary sm:text-4xl">
        Welcome to HiredMate
      </h1>
      <p className="mb-10 max-w-md text-lg text-text-secondary">
        Let&apos;s set up your personalized interview prep in 2 minutes
      </p>

      <Button size="lg" onClick={onNext} className="min-w-[200px]">
        Let&apos;s Go
      </Button>
    </div>
  );
}
