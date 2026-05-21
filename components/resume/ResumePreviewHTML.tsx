'use client';

import type { GeneratedResumeContent, ResumeFormData } from '@/lib/resume';
import { cn } from '@/utils/cn';

interface ResumePreviewHTMLProps {
  formData: ResumeFormData;
  generated: GeneratedResumeContent;
  className?: string;
}

function JobBlock({ job }: { job: GeneratedResumeContent['workExperience'][0] }) {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-bold text-gray-900">{job.jobTitle}</h3>
        <span className="text-xs text-gray-500">
          {job.startDate} – {job.endDate}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        {job.employer}
        {job.location ? ` · ${job.location}` : ''}
        {job.unit ? ` · ${job.unit}` : ''}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-gray-700">
        {job.bullets.map((b, j) => (
          <li key={j} className="flex gap-2">
            <span>•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PillTags({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((c) => (
        <span
          key={c}
          className="rounded-pill bg-[#7C5CBF]/10 px-3 py-1 text-xs font-medium text-[#7C5CBF]"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

export function ResumePreviewHTML({
  formData,
  generated,
  className,
}: ResumePreviewHTMLProps) {
  const { personal } = formData;
  const headshot = personal.headshotBase64 ?? null;
  const contact = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedIn,
  ].filter(Boolean);

  if (formData.format === 'modern') {
    return (
      <div
        className={cn(
          'mx-auto flex max-w-[8.5in] overflow-hidden bg-white font-sans shadow-lg',
          className
        )}
      >
        <aside className="w-[32%] bg-[#7C5CBF] p-8 text-white">
          {headshot && (
            <div className="mb-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headshot}
                alt=""
                className="h-24 w-24 rounded-full border-2 border-white/30 object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold">{personal.fullName}</h1>
          <div className="mt-4 space-y-1 text-xs opacity-90">
            {contact.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <h2 className="mt-8 text-xs font-bold uppercase tracking-wider">
            Certifications
          </h2>
          <ul className="mt-2 space-y-1 text-xs">
            {(generated.certifications || []).map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
          <h2 className="mt-6 text-xs font-bold uppercase tracking-wider">
            Skills
          </h2>
          <ul className="mt-2 space-y-1 text-xs">
            {(generated.clinicalSkills || []).slice(0, 10).map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </aside>
        <main className="w-[68%] p-8 text-gray-800">
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
              Summary
            </h2>
            <p className="mt-2 text-sm italic leading-relaxed text-gray-600">
              {generated.professionalSummary}
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
              Experience
            </h2>
            {generated.workExperience.map((job, i) => (
              <JobBlock key={i} job={job} />
            ))}
          </section>
          {(generated.education?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
                Education
              </h2>
              <ul className="mt-2 space-y-1 text-sm">
                {generated.education!.map((ed, i) => (
                  <li key={i}>
                    <strong>{ed.degree}</strong>, {ed.schoolName} (
                    {ed.graduationYear})
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mx-auto max-w-[8.5in] bg-white p-10 font-sans text-gray-800 shadow-lg',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{personal.fullName}</h1>
          <p className="mt-1 text-sm text-gray-500">{contact.join(' | ')}</p>
        </div>
        {headshot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headshot}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full border-2 border-purple-200 object-cover"
          />
        )}
      </div>
      <div className="my-4 h-0.5 bg-[#7C5CBF]" />

      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
          Professional Summary
        </h2>
        <p className="mt-2 text-sm italic leading-relaxed text-gray-600">
          {generated.professionalSummary}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
          Work Experience
        </h2>
        {generated.workExperience.map((job, i) => (
          <JobBlock key={i} job={job} />
        ))}
      </section>

      {(generated.education?.length ?? 0) > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
            Education
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {generated.education!.map((ed, i) => (
              <li key={i}>
                <strong>{ed.degree}</strong>, {ed.schoolName} ({ed.graduationYear})
                {ed.honors ? ` — ${ed.honors}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(generated.certifications?.length ?? 0) > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
            Certifications
          </h2>
          <PillTags items={generated.certifications!} />
        </section>
      )}

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C5CBF]">
          Skills
        </h2>
        <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-gray-700">Clinical Skills</p>
            <p className="mt-1 text-gray-600">
              {(generated.clinicalSkills || []).join(', ')}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Professional Skills</p>
            <p className="mt-1 text-gray-600">
              {(generated.softSkills || []).join(', ')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
