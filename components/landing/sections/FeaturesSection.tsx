'use client';

import { motion } from 'framer-motion';

const FEATURES = [
  {
    emoji: '🎙️',
    title: 'AI Mock Interviewer',
    desc: 'Practice with Dr. Sarah Chen, Mr. James Mitchell, or Director Karen Walsh. Choose Friendly, Neutral, or Tough mode. The AI pushes back on weak answers and only ends when it\'s satisfied.',
    badge: 'Most Popular',
  },
  {
    emoji: '🔊',
    title: 'Voice Practice Mode',
    desc: "Record your answers out loud. Get instant feedback on filler words, speaking pace (WPM), and clinical accuracy. See 'um' and 'like' highlighted in your transcript.",
  },
  {
    emoji: '🏥',
    title: 'Hospital Prep Packs',
    desc: 'Dedicated prep for Mayo Clinic, Cleveland Clinic, Northwestern, HCA, and Kaiser. Culture briefs, known question patterns, salary ranges, and insider tips.',
  },
  {
    emoji: '⚡',
    title: 'Battle Mode',
    desc: 'Rapid-fire clinical scenarios. 30 seconds per question. Escalating difficulty. Interruptions mid-scenario. The most addictive way to sharpen your clinical judgment.',
  },
  {
    emoji: '📄',
    title: 'Resume Builder',
    desc: 'AI generates an ATS-optimized nursing resume tailored to your specialty. Strong action verbs, specialty-specific language, and a built-in ATS score.',
  },
  {
    emoji: '🏆',
    title: 'Community & Leaderboard',
    desc: 'Compete with nurses nationwide. Earn XP, climb 15 ranks from Nursing Student to Chief Nursing Officer. Share achievements and challenge friends.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#F8F7FF] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00C6B2]">
            Features
          </p>
          <h2
            className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Everything you need to get hired
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            From mock interviews to hospital-specific prep — built for how nurses
            actually get hired.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="relative rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(124,92,191,0.12)]"
            >
              {f.badge && (
                <span className="absolute right-4 top-4 rounded-pill bg-[#F59E0B] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {f.badge}
                </span>
              )}
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="mt-3 text-xl font-bold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
