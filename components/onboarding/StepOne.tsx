'use client';

import Button from '@/components/ui/Button';
import { Stethoscope } from 'lucide-react';

interface StepOneProps {
  onNext: () => void;
}

export default function StepOne({ onNext }: StepOneProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 animate-bounce-soft">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-light-bg">
          <Stethoscope className="h-16 w-16 text-primary" />
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-dark-text sm:text-4xl">
        Welcome to HiredMate 🩺
      </h1>
      <p className="mb-10 max-w-md text-lg text-body-text">
        Let&apos;s set up your personalized interview prep in 2 minutes
      </p>

      <Button size="lg" onClick={onNext} className="min-w-[200px]">
        Let&apos;s Go →
      </Button>
    </div>
  );
}
