'use client';

import { SKILL_CONNECTIONS } from '@/lib/skills';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { SkillWithProgress } from './SkillCard';

const WIDTH = 720;
const HEIGHT = 420;

function nodePosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 150;
  return {
    x: WIDTH / 2 + Math.cos(angle) * radius,
    y: HEIGHT / 2 + Math.sin(angle) * radius,
  };
}

export function SkillConstellation({ skills }: { skills: SkillWithProgress[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  const positions = skills.map((_, index) => nodePosition(index, skills.length));

  return (
    <section className="rounded-[28px] border border-purple-50 bg-white p-6 shadow-card md:p-8">
      <h2 className="text-2xl font-black text-text-primary">Skill Constellation</h2>
      <p className="mt-1 text-text-secondary">
        Connected competencies — hover a node to explore
      </p>

      <motion.div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mx-auto min-w-[720px]"
          role="img"
          aria-label="Skill constellation map"
        >
          {SKILL_CONNECTIONS.map(([fromKey, toKey], index) => {
            const fromIndex = skills.findIndex((skill) => skill.key === fromKey);
            const toIndex = skills.findIndex((skill) => skill.key === toKey);
            if (fromIndex < 0 || toIndex < 0) return null;
            const from = positions[fromIndex];
            const to = positions[toIndex];

            return (
              <motion.line
                key={`${fromKey}-${toKey}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(124,92,191,0.25)"
                strokeWidth={2}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            );
          })}

          {skills.map((skill, index) => {
            const { x, y } = positions[index];
            const size = 28 + skill.level * 4;
            const mastered = skill.level >= skill.maxLevel;
            const label = `${skill.name} · Level ${skill.level}`;

            return (
              <g
                key={skill.key}
                role="img"
                aria-label={label}
                data-tooltip={label}
              >
                <motion.circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={skill.lightColor}
                  stroke={skill.color}
                  strokeWidth={mastered ? 4 : 2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 22,
                    delay: index * 0.1,
                  }}
                  whileHover={{ scale: 1.12 }}
                  style={{
                    filter: mastered
                      ? `drop-shadow(0 0 14px ${skill.color})`
                      : undefined,
                  }}
                />
                <motion.circle
                  cx={x}
                  cy={y}
                  r={size + 6}
                  fill="transparent"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.15 }}
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize="18"
                  className="pointer-events-none select-none"
                  aria-hidden="true"
                >
                  {skill.icon}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
    </section>
  );
}
