'use client';

import { fredoka } from '@/components/landing/brand';
import { motion } from 'framer-motion';
import {
  Building2,
  FileText,
  Mic,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Mic,
    gradient: 'from-purple-500 to-[#7C5CBF]',
    badge: 'Most Popular',
    title: 'Mock Interviewer',
    description:
      'Dr. Sarah Chen, Mr. James Mitchell, or Director Karen Walsh. Friendly, Neutral, or Tough. Pushes back until your answer is actually good.',
  },
  {
    icon: Volume2,
    gradient: 'from-teal-400 to-[#00C6B2]',
    title: 'Voice Practice',
    description:
      "Record out loud. Get filler word counts, WPM pace rating, and clinical accuracy feedback. Watch 'um' and 'like' get highlighted in your transcript.",
  },
  {
    icon: Building2,
    gradient: 'from-blue-500 to-blue-700',
    title: 'Hospital Packs',
    description:
      'Mayo Clinic, Cleveland Clinic, Northwestern, HCA, Kaiser. Culture briefs, known question patterns, salary ranges, insider tips.',
  },
  {
    icon: Zap,
    gradient: 'from-red-500 to-orange-600',
    title: 'Battle Mode',
    description:
      '30-second timer. Escalating difficulty. Mid-scenario interruptions. Rapid-fire clinical judgment under pressure.',
  },
  {
    icon: FileText,
    gradient: 'from-green-500 to-emerald-600',
    title: 'Resume Builder',
    description:
      'ATS-optimized nursing resumes with specialty language, strong action verbs, and a built-in ATS score out of 100.',
  },
  {
    icon: Trophy,
    gradient: 'from-[#F59E0B] to-amber-600',
    title: 'Community',
    description:
      'Global leaderboard. 15 nurse ranks. Friend challenges. Shareable achievement cards for Instagram.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      <div className="landing-grid-pattern pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#00C6B2]">
            Features
          </p>
          <h2
            className="mt-3 text-4xl font-black text-white"
            style={fredoka}
          >
            Everything you need to get hired
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/50">
            AI mock interviews, voice analysis, hospital packs, and more — built
            for nursing careers.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {feature.badge && (
                    <span className="rounded-full bg-[#F59E0B]/20 px-2.5 py-0.5 text-xs font-bold text-[#F59E0B]">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
