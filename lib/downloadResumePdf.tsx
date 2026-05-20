'use client';

import { ResumeDocument } from '@/components/resume/ResumeDocument';
import type { GeneratedResumeContent, ResumeFormData } from '@/lib/resume';
import { pdf } from '@react-pdf/renderer';

export async function downloadResumePdf(
  formData: ResumeFormData,
  generated: GeneratedResumeContent
) {
  const blob = await pdf(
    <ResumeDocument formData={formData} generated={generated} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName =
    formData.personal.fullName.replace(/\s+/g, '-').toLowerCase() ||
    'nursing';
  a.href = url;
  a.download = `${safeName}-nursing-resume.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
