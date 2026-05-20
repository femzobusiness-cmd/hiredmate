'use client';

import { MockInterviewSession } from '@/components/mock-interview/MockInterviewSession';
import { Suspense } from 'react';

function SessionFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F8F7FF]">
      <p className="font-medium text-[#7C5CBF]">Loading interview...</p>
    </div>
  );
}

export default function MockInterviewSessionPage() {
  return (
    <Suspense fallback={<SessionFallback />}>
      <MockInterviewSession />
    </Suspense>
  );
}
