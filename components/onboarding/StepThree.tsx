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
  tone: string;
}[] = [
  { value: 'Today/Tomorrow', label: 'Today/Tomorrow', tone: 'bg-red-400' },
  { value: 'This Week', label: 'This Week', tone: 'bg-gold' },
  { value: 'Within a Month', label: 'Within a Month', tone: 'bg-secondary' },
  { value: 'Just Exploring', label: 'Just Exploring', tone: 'bg-text-muted' },
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
      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        Tell us about your interview
      </h2>
      <p className="mb-8 text-text-secondary">
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
        <label className="mb-3 block text-sm font-semibold text-text-primary">
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
                  ? 'border-primary bg-input text-primary'
                  : 'border-border bg-card text-text-primary hover:border-primary/50'
              )}
            >
              <span className={cn('h-2.5 w-2.5 rounded-full', t.tone)} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <label className="mb-3 block text-sm font-semibold text-text-primary">
          Resume (optional)
        </label>
        <div
          {...getRootProps()}
          className={cn(
            'cursor-pointer rounded-card border-2 border-dashed p-8 text-center transition-all',
            isDragActive
              ? 'border-primary bg-input'
              : 'border-primary/50 bg-card hover:border-primary hover:bg-input/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          ) : resumeFile ? (
            <div className="flex items-center justify-center gap-2">
              <FileUp className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-text-primary">
                {resumeFile.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onResumeChange(null);
                }}
                className="ml-2 rounded-full p-1 hover:bg-input"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>
          ) : (
            <>
              <FileUp className="mx-auto mb-3 h-10 w-10 text-primary" />
              <p className="font-medium text-text-primary">
                Drop your resume PDF here
              </p>
              <p className="mt-1 text-sm text-text-secondary">or click to upload</p>
              <p className="mt-2 text-xs text-text-muted">
                We will pull key experience from PDFs under 5MB.
              </p>
            </>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue || uploading} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
