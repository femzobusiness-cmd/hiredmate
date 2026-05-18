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
      const filePath = `${userId}/${Date.now()}-${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile);

      if (uploadError) throw uploadError;

      const formData = new FormData();
      formData.append('file', resumeFile);

      const parseRes = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      let resumeText: string | null = null;
      if (parseRes.ok) {
        const parsed = await parseRes.json();
        resumeText = parsed.text;
      }

      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl, text: resumeText };
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

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
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
        });

      if (updateError) throw updateError;

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
        <div className="mb-2 flex justify-between text-sm text-body-text">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-pill bg-light-bg">
          <div
            className="h-full rounded-pill bg-purple-gradient transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        {error && (
          <p className="mb-4 rounded-card bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

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
