'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function ResumeWidget() {
  const [latestTitle, setLatestTitle] = useState<string | null>(null);
  const [latestId, setLatestId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('resumes')
      .select('id, title')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLatestTitle(data.title);
          setLatestId(data.id);
        }
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
      className="rounded-[20px] bg-white p-6 shadow-card"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-text-primary">📄 Resume Builder</h3>
        <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold text-white">
          NEW
        </span>
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        AI builds your ATS-optimized nursing resume in minutes.
      </p>
      <ul className="mt-3 space-y-1 text-sm font-medium text-[#00A896]">
        <li>✓ ATS-Optimized</li>
        <li>✓ Specialty-Tailored</li>
        <li>✓ PDF Export</li>
      </ul>
      {latestTitle && latestId && (
        <Link
          href={`/resume-builder/${latestId}`}
          className="mt-3 block text-sm font-semibold text-[#7C5CBF] hover:underline"
        >
          Continue editing: {latestTitle}
        </Link>
      )}
      <Link
        href="/resume-builder"
        className="mt-5 flex w-full items-center justify-center rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8] py-3 text-sm font-bold text-white"
      >
        Build My Resume →
      </Link>
    </motion.div>
  );
}
