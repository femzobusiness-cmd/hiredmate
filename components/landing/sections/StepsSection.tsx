'use client';

import { motion } from 'framer-motion';
import { Mic, Trophy, UserPlus } from 'lucide-react';

const STEPS = [
  {
    icon: UserPlus,
    bg: 'bg-[#7C5CBF]',
    title: 'Create your free account',
    desc: 'Sign up in 30 seconds. No credit card. Tell us your specialty and target hospital.',
  },
  {
    icon: Mic,
    bg: 'bg-[#00C6B2]',
    title: 'Practice with your AI interviewer',
    desc: 'Choose your mode — Mock Interview, Voice Practice, Hospital Pack, or Battle Mode. Get real-time feedback on every answer.',
  },
  {
    icon: Trophy,
    bg: 'bg-[#F59E0B]',
    title: 'Walk in confident',
    desc: 'Know exactly what your target hospital asks, how to answer it, and what salary to negotiate. Show up prepared.',
  },
];

export function StepsSection() {
  return (
    <section id="how-it-works" className="bg-[#F8F7FF] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-black text-gray-900 sm:text-4xl"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Get interview-ready in 3 steps
        </motion.h2>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            className="absolute left-[16%] right-[16%] top-10 hidden h-0.5 bg-[#7C5CBF]/20 md:block"
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${step.bg} text-white shadow-lg`}
              >
                <step.icon className="h-9 w-9" />
              </div>
              <span className="mt-2 text-xs font-bold text-[#7C5CBF]">
                Step {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
