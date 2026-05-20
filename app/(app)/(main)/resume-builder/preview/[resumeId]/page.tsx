'use client';

import { ResumePreviewClient } from '@/components/resume/ResumePreviewClient';
import { useParams } from 'next/navigation';

export default function ResumePreviewPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;

  return <ResumePreviewClient resumeId={resumeId} />;
}
