'use client';

import { fredoka } from '@/components/landing/brand';
import { motion } from 'framer-motion';
import { Briefcase, CalendarCheck, UserPlus } from 'lucide-react';

const STEPS = [
  {
    num: '1',
    icon: UserPlus,
    title: 'Create your account',
    description: '30 seconds, no card, set your specialty',
  },
  {
    num: '2',
    icon: CalendarCheck,
    title: 'Practice every day',
    description:
      'Mock interviews, voice practice, hospital packs, battle mode',
  },
  {
    num: '3',
    icon: Briefcase,
    title: 'Walk in confident',
    description:
      "Know exactly what they'll ask and how to answer it",
  },
];

export function StepsSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#7C5CBF]">
            How it works
          </p>
          <h2 className="mt-3 text-4xl font-black text-white" style={fredoka}>
            Get hired in 3 steps
          </h2>
        </motion.div>

        <div className="relative mt-16">
          <div
            className="absolute left-[16%] right-[16%] top-6 hidden h-0.5 bg-gradient-to-r from-purple-500/20 via-purple-400/50 to-purple-500/20 md:block"
            aria-hidden
          />
          <div className="grid gap-12 md:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-purple-400/50 bg-purple-500/20 text-lg font-black text-purple-300">
                    {step.num}
                  </div>
                  <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#7C5CBF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-white/50">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
