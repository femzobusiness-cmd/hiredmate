'use client';

import { ResumeBuilderForm } from '@/components/resume/ResumeBuilderForm';
import { useParams } from 'next/navigation';

export default function EditResumePage() {
  const params = useParams();
  const resumeId = params.id as string;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ResumeBuilderForm resumeId={resumeId} />
    </div>
  );
}
