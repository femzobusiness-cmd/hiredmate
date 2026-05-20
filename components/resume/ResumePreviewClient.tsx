'use client';

import { ResumePreviewHTML } from '@/components/resume/ResumePreviewHTML';
import { downloadResumePdf } from '@/lib/downloadResumePdf';
import {
  atsScoreColor,
  computeDisplayAtsScore,
  type GeneratedResumeContent,
  type ResumeFormData,
} from '@/lib/resume';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const REGENERATE_SECTIONS = [
  { value: 'professionalSummary', label: 'Professional Summary' },
  { value: 'workExperience', label: 'Work Experience' },
  { value: 'education', label: 'Education' },
  { value: 'skills', label: 'Skills & Keywords' },
];

export function ResumePreviewClient({ resumeId }: { resumeId: string }) {
  const [formData, setFormData] = useState<ResumeFormData | null>(null);
  const [generated, setGenerated] = useState<GeneratedResumeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [section, setSection] = useState(REGENERATE_SECTIONS[0].value);
  const [shareMsg, setShareMsg] = useState('');

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('resumes')
      .select('resume_data, generated_content')
      .eq('id', resumeId)
      .single();

    if (data) {
      setFormData(data.resume_data as ResumeFormData);
      setGenerated(data.generated_content as GeneratedResumeContent);
    }
    setLoading(false);
  }, [resumeId]);

  useEffect(() => {
    load();
  }, [load]);

  const atsScore = computeDisplayAtsScore(generated, formData);
  const scoreColor = atsScoreColor(atsScore);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (atsScore / 100) * circumference;

  const handleDownload = async () => {
    if (!formData || !generated) return;
    setDownloading(true);
    try {
      await downloadResumePdf(formData, generated);
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch('/api/resume/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, section }),
      });
      const data = await res.json();
      if (data.generated) {
        setGenerated(data.generated);
        await load();
      }
    } finally {
      setRegenerating(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/resume-builder/preview/${resumeId}`;
    navigator.clipboard.writeText(url);
    setShareMsg('Link copied!');
    setTimeout(() => setShareMsg(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C5CBF]" />
      </div>
    );
  }

  if (!formData || !generated) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-secondary">Resume not found.</p>
        <Link href="/resume-builder" className="mt-4 text-[#7C5CBF] underline">
          Back to Resume Builder
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-r border-gray-100 bg-white p-6 shadow-card lg:fixed lg:h-screen lg:w-80">
        <Link
          href={`/resume-builder/${resumeId}`}
          className="flex items-center gap-1 text-sm font-semibold text-[#7C5CBF]"
        >
          <ChevronLeft className="h-4 w-4" />
          Edit Resume
        </Link>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-[#00C6B2] to-[#00A896] py-3 font-bold text-white"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Download PDF ⬇'
          )}
        </button>

        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Regenerate Section
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="mt-2 w-full rounded-input border border-input-border px-3 py-2 text-sm"
          >
            {REGENERATE_SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="mt-2 w-full rounded-pill border border-[#7C5CBF] py-2 text-sm font-bold text-[#7C5CBF]"
          >
            {regenerating ? 'Regenerating…' : 'Regenerate with AI'}
          </button>
        </div>

        <div className="mt-8 rounded-[20px] border border-gray-100 p-4">
          <p className="text-center text-xs font-bold uppercase text-text-muted">
            ATS Score
          </p>
          <div className="relative mx-auto mt-3 h-28 w-28">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#ede9fe"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-2xl font-black"
              style={{ color: scoreColor }}
            >
              {atsScore}
            </span>
          </div>
          <p className="text-center text-xs text-text-muted">out of 100</p>

          <button
            type="button"
            onClick={() => setTipsOpen((o) => !o)}
            className="mt-4 flex w-full items-center justify-between text-sm font-semibold text-[#7C5CBF]"
          >
            ATS Tips
            <ChevronDown
              className={cn('h-4 w-4 transition', tipsOpen && 'rotate-180')}
            />
          </button>
          <AnimatePresence>
            {tipsOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-2 overflow-hidden text-sm text-text-secondary"
              >
                {(generated.atsTips || []).map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="text-[#F59E0B]">•</span>
                    {tip}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="mt-4 w-full rounded-pill border border-gray-200 py-2 text-sm font-semibold"
        >
          {shareMsg || 'Share Preview Link'}
        </button>
      </aside>

      <main className="flex-1 bg-gray-50 p-6 lg:ml-80 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResumePreviewHTML formData={formData} generated={generated} />
        </motion.div>
      </main>
    </div>
  );
}
