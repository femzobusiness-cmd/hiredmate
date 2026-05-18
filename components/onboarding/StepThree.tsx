'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { InterviewTimeline } from '@/lib/types';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, X } from 'lucide-react';

const TIMELINES: {
  value: InterviewTimeline;
  label: string;
  emoji: string;
}[] = [
  { value: 'Today/Tomorrow', label: 'Today/Tomorrow', emoji: '🔴' },
  { value: 'This Week', label: 'This Week', emoji: '🟡' },
  { value: 'Within a Month', label: 'Within a Month', emoji: '🟢' },
  { value: 'Just Exploring', label: 'Just Exploring', emoji: '⚪' },
];

interface StepThreeProps {
  hospitalName: string;
  jobTitle: string;
  interviewTimeline: InterviewTimeline | null;
  resumeFile: File | null;
  uploading: boolean;
  onHospitalChange: (v: string) => void;
  onJobTitleChange: (v: string) => void;
  onTimelineChange: (t: InterviewTimeline) => void;
  onResumeChange: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepThree({
  hospitalName,
  jobTitle,
  interviewTimeline,
  resumeFile,
  uploading,
  onHospitalChange,
  onJobTitleChange,
  onTimelineChange,
  onResumeChange,
  onNext,
  onBack,
}: StepThreeProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setError(null);
      const file = accepted[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be under 5MB');
        return;
      }
      onResumeChange(file);
    },
    [onResumeChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const canContinue = jobTitle.trim() && interviewTimeline;

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-dark-text">
        Tell us about your interview
      </h2>
      <p className="mb-8 text-body-text">
        Optional details help us personalize your prep
      </p>

      <div className="mb-6 space-y-4">
        <Input
          label="Hospital name (optional)"
          placeholder="e.g. Mayo Clinic"
          value={hospitalName}
          onChange={(e) => onHospitalChange(e.target.value)}
        />
        <Input
          label="Job title"
          placeholder="e.g. Registered Nurse — ICU"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label className="mb-3 block text-sm font-semibold text-dark-text">
          Interview timeline
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TIMELINES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onTimelineChange(t.value)}
              className={cn(
                'flex items-center gap-2 rounded-card border-2 p-4 text-left text-sm font-medium transition-all',
                interviewTimeline === t.value
                  ? 'border-primary bg-light-bg text-primary'
                  : 'border-primary/20 bg-white text-dark-text hover:border-primary/40'
              )}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <label className="mb-3 block text-sm font-semibold text-dark-text">
          Resume (optional)
        </label>
        <div
          {...getRootProps()}
          className={cn(
            'cursor-pointer rounded-card border-2 border-dashed p-8 text-center transition-all',
            isDragActive
              ? 'border-primary bg-light-bg'
              : 'border-primary/40 bg-white hover:border-primary hover:bg-light-bg/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          ) : resumeFile ? (
            <div className="flex items-center justify-center gap-2">
              <FileUp className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-dark-text">
                {resumeFile.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onResumeChange(null);
                }}
                className="ml-2 rounded-full p-1 hover:bg-light-bg"
              >
                <X className="h-4 w-4 text-body-text" />
              </button>
            </div>
          ) : (
            <>
              <FileUp className="mx-auto mb-3 h-10 w-10 text-primary" />
              <p className="font-medium text-dark-text">
                Drop your resume PDF here
              </p>
              <p className="mt-1 text-sm text-body-text">or click to upload</p>
            </>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue || uploading} className="flex-1">
          Continue →
        </Button>
      </div>
    </div>
  );
}
