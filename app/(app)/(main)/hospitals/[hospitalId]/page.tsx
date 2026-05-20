'use client';

import { formatSalaryRange, getHospitalById } from '@/lib/hospitals-data';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';

function SectionCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
    >
      {children}
    </motion.div>
  );
}

export default function HospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.hospitalId as string;
  const hospital = getHospitalById(hospitalId);

  if (!hospital) {
    notFound();
  }

  const gradient = `linear-gradient(135deg, ${hospital.gradientFrom}, ${hospital.gradientTo})`;

  return (
    <motion.div className="min-h-screen pb-12">
      <motion.div
        className="relative overflow-hidden px-4 py-10 md:px-8"
        style={{ background: gradient }}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <motion.div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-white/5" />

        <motion.div className="relative mx-auto max-w-4xl">
          <Link
            href="/hospitals"
            className="mb-6 inline-block text-sm font-medium text-white/70 hover:text-white"
          >
            ← Back to Hospital Packs
          </Link>

          <div className="flex flex-wrap items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl">
              {hospital.emoji}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white">{hospital.name}</h1>
              <p className="mt-1 text-white/90">{hospital.type}</p>
              <p className="mt-2 text-sm text-white/80">📍 {hospital.location}</p>
              <p className="mt-3 text-lg italic text-white/90">
                &ldquo;{hospital.tagline}&rdquo;
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {hospital.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="mx-auto mt-8 max-w-4xl space-y-6 px-4 md:px-0">
        <SectionCard index={0}>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ background: gradient }}
          >
            {hospital.badgeText}
          </span>
          <h2 className="mt-4 text-xl font-bold text-[#1a1a2e]">
            Ready to practice in {hospital.shortName} mode?
          </h2>
          <p className="mt-2 text-gray-600">
            AI generates questions in the style of {hospital.name} interviewers
          </p>
          <button
            type="button"
            onClick={() => router.push(`/hospitals/${hospital.id}/practice`)}
            className="mt-5 rounded-full px-8 py-3 text-sm font-bold text-white"
            style={{ background: gradient }}
          >
            Start Practice →
          </button>
        </SectionCard>

        <SectionCard index={1}>
          <h3 className="text-lg font-bold text-[#1a1a2e]">🎯 Interview Style</h3>
          <p className="mt-3 font-medium text-[#7C5CBF]">{hospital.interviewStyle}</p>
          <p className="mt-3 text-gray-600">{hospital.interviewerPersonality}</p>
        </SectionCard>

        <SectionCard index={2}>
          <h3 className="text-lg font-bold text-[#1a1a2e]">🏛️ Culture Brief</h3>
          <ul className="mt-4 space-y-2">
            {hospital.culture.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-gray-700">
                <span className="text-[#00C6B2]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard index={3}>
          <h3 className="text-lg font-bold text-[#1a1a2e]">
            💬 Known Question Patterns
          </h3>
          <ol className="mt-4 space-y-3">
            {hospital.knownQuestionPatterns.map((q, i) => (
              <li
                key={q}
                className="rounded-[12px] border border-[#7C5CBF]/20 bg-[#F8F7FF] p-4 text-sm text-gray-800"
              >
                <span className="mr-2 font-bold text-[#7C5CBF]">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard index={4}>
          <h3 className="text-lg font-bold text-[#1a1a2e]">
            💰 Salary Expectations
          </h3>
          <ul className="mt-4 space-y-3">
            {hospital.salaryByRole.map((row) => (
              <li
                key={row.role}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{row.role}</span>
                <span className="font-bold text-[#F59E0B]">
                  {formatSalaryRange(row)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            Salary ranges are estimates based on publicly available data.
          </p>
        </SectionCard>

        <SectionCard index={5}>
          <h3 className="text-lg font-bold text-[#1a1a2e]">
            📋 Unit-Specific Expectations
          </h3>
          <ul className="mt-4 space-y-2">
            {hospital.unitExpectations.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-gray-700">
                <span className="font-bold text-[#7C5CBF]">→</span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard index={6}>
          <div className="rounded-[16px] bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 p-5">
            <h3 className="text-lg font-bold text-[#1a1a2e]">⭐ Insider Tips</h3>
            <ul className="mt-4 space-y-2">
              {hospital.insiderTips.map((tip) => (
                <li key={tip} className="flex gap-2 text-sm text-gray-700">
                  <span>💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="py-8 text-center"
        >
          <button
            type="button"
            onClick={() => router.push(`/hospitals/${hospital.id}/practice`)}
            className="rounded-full px-10 py-4 text-sm font-bold text-white"
            style={{ background: gradient }}
          >
            Start {hospital.badgeText} →
          </button>
          <p className="mt-3 text-sm text-gray-500">
            AI-generated questions tailored to {hospital.name}&apos;s interview
            style
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
