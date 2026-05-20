'use client';

import { HOSPITALS, type Hospital } from '@/lib/hospitals-data';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function HospitalCard({ hospital, index }: { hospital: Hospital; index: number }) {
  const router = useRouter();
  const visibleSpecialties = hospital.specialties.slice(0, 3);
  const extraCount = hospital.specialties.length - 3;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/hospitals/${hospital.id}`)}
      className="w-full cursor-pointer rounded-[20px] bg-white p-0 text-left shadow-[0_8px_30px_rgba(124,92,191,0.12)] transition-shadow hover:shadow-[0_12px_40px_rgba(124,92,191,0.18)]"
    >
      <motion.div
        className="h-0.5 w-full rounded-t-[20px]"
        style={{
          background: `linear-gradient(90deg, ${hospital.gradientFrom}, ${hospital.gradientTo})`,
        }}
      />
      <motion.div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: `linear-gradient(135deg, ${hospital.gradientFrom}22, ${hospital.gradientTo}33)`,
            }}
          >
            {hospital.emoji}
          </div>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${hospital.gradientFrom}, ${hospital.gradientTo})`,
            }}
          >
            {hospital.badgeText}
          </span>
        </div>

        <h2 className="text-lg font-bold text-[#1a1a2e]">{hospital.name}</h2>
        <p className="mt-0.5 text-sm text-[#7C5CBF]">{hospital.type}</p>
        <p className="mt-2 text-sm text-gray-500">📍 {hospital.location}</p>
        <p className="mt-3 text-sm italic text-gray-600">
          &ldquo;{hospital.tagline}&rdquo;
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleSpecialties.map((s) => (
            <span
              key={s}
              className="rounded-full bg-[#F8F7FF] px-3 py-1 text-xs font-medium text-[#7C5CBF]"
            >
              {s}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="rounded-full bg-[#F8F7FF] px-3 py-1 text-xs font-medium text-gray-500">
              +{extraCount} more
            </span>
          )}
        </div>

        <span
          className="mt-5 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${hospital.gradientFrom}, ${hospital.gradientTo})`,
          }}
        >
          View Prep Pack →
        </span>
      </motion.div>
    </motion.button>
  );
}

export default function HospitalsPage() {
  return (
    <div className="relative min-h-screen px-4 py-8 md:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-[#7C5CBF]/20 blur-3xl"
          animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-[#00C6B2]/15 blur-3xl"
          animate={{ x: [20, -20, 20], y: [10, -10, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C5CBF]">
          Hospital Prep Packs
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#1a1a2e] md:text-4xl">
          Practice for Your Exact Hospital 🏥
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Each pack is tailored to the culture, interview style, and salary
          expectations of a specific health system.
        </p>

        <motion.div className="mt-10 grid gap-6 md:grid-cols-2">
          {HOSPITALS.map((hospital, i) => (
            <HospitalCard key={hospital.id} hospital={hospital} index={i} />
          ))}
        </motion.div>

        <p className="mt-10 text-center text-sm text-gray-500">
          More hospitals coming soon ·{' '}
          <Link href="/settings" className="font-medium text-[#7C5CBF] hover:underline">
            Suggest a hospital in Settings
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
