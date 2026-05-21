'use client';

import { HOSPITALS } from '@/lib/hospitals-data';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function HospitalsSection() {
  return (
    <section id="hospitals" className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C5CBF]">
            Hospital Prep Packs
          </p>
          <h2
            className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Practice for your exact hospital
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Each pack is tailored to that hospital&apos;s culture, interview style,
            and salary expectations.
          </p>
        </motion.div>

        <div className="-mx-4 mt-12 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-thin md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {HOSPITALS.map((hospital, i) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="w-[280px] shrink-0 snap-center md:w-auto"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_8px_30px_rgba(124,92,191,0.12)]">
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${hospital.gradientFrom}, ${hospital.gradientTo})`,
                  }}
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl">{hospital.emoji}</span>
                  </div>
                  <h3 className="mt-3 font-bold text-gray-900">{hospital.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">📍 {hospital.location.split('·')[0].trim()}</p>
                  <p className="mt-3 flex-1 text-sm italic text-gray-600">
                    &ldquo;{hospital.insiderTips[0] || hospital.tagline}&rdquo;
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-pill py-2.5 text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${hospital.gradientFrom}, ${hospital.gradientTo})`,
                    }}
                  >
                    View Pack →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          More hospitals coming soon
        </p>
      </div>
    </section>
  );
}
