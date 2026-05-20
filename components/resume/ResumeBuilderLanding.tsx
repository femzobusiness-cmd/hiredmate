'use client';

import { downloadResumePdf } from '@/lib/downloadResumePdf';
import type { GeneratedResumeContent, ResumeFormData } from '@/lib/resume';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type SavedResume = {
  id: string;
  title: string;
  specialty: string | null;
  target_role: string | null;
  updated_at: string;
  resume_data: ResumeFormData | null;
  generated_content: GeneratedResumeContent | null;
};

const features = [
  {
    emoji: '📋',
    title: 'ATS Keywords',
    desc: 'AI injects nursing-specific keywords that pass applicant tracking systems',
  },
  {
    emoji: '🏥',
    title: 'Specialty Language',
    desc: 'Different language for ICU vs L&D vs OR — not generic nurse speak',
  },
  {
    emoji: '✨',
    title: 'Action Verbs',
    desc: 'Strong clinical action verbs that make your experience stand out',
  },
];

export function ResumeBuilderLanding() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadResumes = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('resumes')
      .select(
        'id, title, specialty, target_role, updated_at, resume_data, generated_content'
      )
      .order('updated_at', { ascending: false });
    setResumes((data as SavedResume[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('resumes').delete().eq('id', id);
    setResumes((r) => r.filter((x) => x.id !== id));
  };

  const handleDownload = async (resume: SavedResume) => {
    if (!resume.resume_data || !resume.generated_content) return;
    setDownloadingId(resume.id);
    try {
      await downloadResumePdf(resume.resume_data, resume.generated_content);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C5CBF]">
        Resume Builder
      </p>
      <h1 className="mt-2 text-4xl font-black text-text-primary">
        Build Your Nursing Resume 📄
      </h1>
      <p className="mt-3 text-text-secondary">
        AI generates an ATS-optimized nursing resume tailored to your specialty.
        Interview prep + resume in one place.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {['ATS-Optimized', 'Specialty-Tailored'].map((pill) => (
          <span
            key={pill}
            className="rounded-pill bg-[#00C6B2]/15 px-4 py-1.5 text-sm font-bold text-[#00A896]"
          >
            {pill}
          </span>
        ))}
      </div>

      {!loading && resumes.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Your Resumes</h2>
          <AnimatePresence>
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative rounded-[20px] bg-white p-6 shadow-card"
              >
                <button
                  type="button"
                  onClick={() => handleDelete(resume.id)}
                  className="absolute right-4 top-4 rounded-full p-1.5 text-red-500 hover:bg-red-50"
                  aria-label="Delete resume"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-3 pr-8">
                  <FileText className="mt-1 h-6 w-6 text-[#7C5CBF]" />
                  <div>
                    <h3 className="font-bold text-text-primary">{resume.title}</h3>
                    <p className="text-sm text-text-secondary">
                      {resume.specialty}
                      {resume.target_role ? ` · ${resume.target_role}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Updated{' '}
                      {new Date(resume.updated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/resume-builder/${resume.id}`}
                    className="rounded-pill border-2 border-[#7C5CBF] px-5 py-2 text-sm font-bold text-[#7C5CBF]"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={
                      !resume.generated_content ||
                      downloadingId === resume.id
                    }
                    onClick={() => handleDownload(resume)}
                    className={cn(
                      'rounded-pill bg-gradient-to-r from-[#00C6B2] to-[#00A896] px-5 py-2 text-sm font-bold text-white',
                      (!resume.generated_content || downloadingId === resume.id) &&
                        'opacity-60'
                    )}
                  >
                    {downloadingId === resume.id ? 'Preparing…' : 'Download PDF'}
                  </button>
                  {resume.generated_content && (
                    <Link
                      href={`/resume-builder/preview/${resume.id}`}
                      className="rounded-pill px-5 py-2 text-sm font-semibold text-[#7C5CBF] hover:underline"
                    >
                      Preview
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Link
        href="/resume-builder/new"
        className="mt-8 flex w-full items-center justify-center rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8] py-4 text-lg font-bold text-white shadow-card"
      >
        + Create New Resume
      </Link>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-[20px] bg-white p-5 shadow-card"
          >
            <span className="text-2xl">{f.emoji}</span>
            <h3 className="mt-2 font-bold text-text-primary">{f.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

