'use client';

import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { ExperienceLevel, Specialty } from '@/lib/types';

const SPECIALTIES: Specialty[] = [
  'ICU',
  'ER',
  'Med-Surg',
  'L&D',
  'Oncology',
  'Pediatrics',
  'OR/Surgical',
  'Psych',
  'Travel Nurse',
  'Other',
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'New Graduate',
  'Early Career (1-3yr)',
  'Experienced (3yr+)',
  'Travel Nurse',
];

interface StepTwoProps {
  specialty: Specialty | null;
  experienceLevel: ExperienceLevel | null;
  onSpecialtyChange: (s: Specialty) => void;
  onExperienceChange: (e: ExperienceLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTwo({
  specialty,
  experienceLevel,
  onSpecialtyChange,
  onExperienceChange,
  onNext,
  onBack,
}: StepTwoProps) {
  const canContinue = specialty && experienceLevel;

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-dark-text">Tell us about you</h2>
      <p className="mb-8 text-body-text">
        We&apos;ll tailor questions to your specialty and experience
      </p>

      <div className="mb-8">
        <label className="mb-3 block text-sm font-semibold text-dark-text">
          Your specialty
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpecialtyChange(s)}
              className={cn(
                'rounded-pill border-2 px-4 py-2 text-sm font-medium transition-all',
                specialty === s
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/40 bg-white text-primary hover:bg-light-bg'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <label className="mb-3 block text-sm font-semibold text-dark-text">
          Experience level
        </label>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-card border-2 p-4 transition-all',
                experienceLevel === level
                  ? 'border-primary bg-light-bg'
                  : 'border-primary/20 bg-white hover:border-primary/40'
              )}
            >
              <input
                type="radio"
                name="experience"
                checked={experienceLevel === level}
                onChange={() => onExperienceChange(level)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-medium text-dark-text">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="flex-1">
          Continue →
        </Button>
      </div>
    </div>
  );
}
