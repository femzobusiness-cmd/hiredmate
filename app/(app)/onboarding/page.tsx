'use client';

import CompletionScreen from '@/components/onboarding/CompletionScreen';
import StepFour from '@/components/onboarding/StepFour';
import StepOne from '@/components/onboarding/StepOne';
import StepThree from '@/components/onboarding/StepThree';
import StepTwo from '@/components/onboarding/StepTwo';
import Card from '@/components/ui/Card';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  BiggestFear,
  ExperienceLevel,
  InterviewTimeline,
  Specialty,
} from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const supabase = createSupabaseBrowserClient();

  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [hospitalName, setHospitalName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [interviewTimeline, setInterviewTimeline] =
    useState<InterviewTimeline | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fears, setFears] = useState<BiggestFear[]>([]);

  const toggleFear = (fear: BiggestFear) => {
    setFears((prev) =>
      prev.includes(fear) ? prev.filter((f) => f !== fear) : [...prev, fear]
    );
  };

  const uploadResume = async (userId: string): Promise<{
    url: string | null;
    text: string | null;
  }> => {
    if (!resumeFile) return { url: null, text: null };

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);

      const parseRes = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const parsed = (await parseRes.json()) as {
        text?: string;
        error?: string;
      };

      if (!parseRes.ok || !parsed.text) {
        throw new Error(parsed.error || 'Unable to read text from this PDF');
      }

      const filePath = `${userId}/${Date.now()}-${sanitizeFileName(resumeFile.name)}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, {
          contentType: resumeFile.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      return { url: filePath, text: parsed.text };
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { url: resumeUrl, text: resumeText } = await uploadResume(user.id);

      const interviewDate = getInterviewDate(interviewTimeline);
      const profileData = {
        user_id: user.id,
        specialty,
        experience_level: experienceLevel,
        hospital_name: hospitalName || null,
        job_title: jobTitle,
        interview_timeline: interviewTimeline,
        interview_date: interviewDate,
        biggest_fears: fears,
        resume_url: resumeUrl,
        resume_text: resumeText,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      console.log('Saving profile...');
      console.log('Profile data being saved:', profileData);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        });

      if (updateError) {
        console.error('Supabase profile save error:', updateError);
        throw updateError;
      }

      await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <CompletionScreen />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-text-secondary">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-pill bg-border">
          <motion.div
            className="h-full rounded-pill bg-purple-gradient transition-all duration-500"
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <Card>
        {error && (
          <p className="mb-4 rounded-card bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {step === 1 && <StepOne onNext={() => setStep(2)} />}
            {step === 2 && (
              <StepTwo
                specialty={specialty}
                experienceLevel={experienceLevel}
                onSpecialtyChange={setSpecialty}
                onExperienceChange={setExperienceLevel}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepThree
                hospitalName={hospitalName}
                jobTitle={jobTitle}
                interviewTimeline={interviewTimeline}
                resumeFile={resumeFile}
                uploading={uploading}
                onHospitalChange={setHospitalName}
                onJobTitleChange={setJobTitle}
                onTimelineChange={setInterviewTimeline}
                onResumeChange={setResumeFile}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <StepFour
                fears={fears}
                loading={loading}
                onToggleFear={toggleFear}
                onSubmit={handleSubmit}
                onBack={() => setStep(3)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}

function getInterviewDate(timeline: InterviewTimeline | null): string | null {
  if (!timeline) return null;
  const now = new Date();
  switch (timeline) {
    case 'Today/Tomorrow':
      now.setDate(now.getDate() + 1);
      break;
    case 'This Week':
      now.setDate(now.getDate() + 5);
      break;
    case 'Within a Month':
      now.setDate(now.getDate() + 21);
      break;
    default:
      return null;
  }
  return now.toISOString().split('T')[0];
}

function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);

  return sanitized || 'resume.pdf';
}
