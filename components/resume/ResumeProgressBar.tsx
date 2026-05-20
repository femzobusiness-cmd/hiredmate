'use client';

import { cn } from '@/utils/cn';

const STEPS = [
  'Personal Info',
  'Experience',
  'Education',
  'Skills',
  'Generate',
];

export function ResumeProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < currentStep;
          const active = step === currentStep;
          return (
            <div key={label} className="flex flex-1 items-center">
              {i > 0 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    done || active ? 'bg-[#7C5CBF]' : 'bg-gray-200'
                  )}
                />
              )}
              <div className="flex flex-col items-center px-1">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                    done && 'bg-[#7C5CBF] text-white',
                    active && 'bg-[#7C5CBF] text-white ring-4 ring-[#7C5CBF]/30',
                    !done && !active && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {step}
                </div>
                <span
                  className={cn(
                    'mt-1 hidden text-[9px] font-semibold sm:block',
                    active ? 'text-[#7C5CBF]' : 'text-text-muted'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    step < currentStep ? 'bg-[#7C5CBF]' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
