'use client';

import { PageTransition } from '@/components/ui/PageTransition';
import {
  filterSkillsByTab,
  getOverallNurseLevel,
  SKILL_TABS,
  type SkillTab,
} from '@/lib/skills';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { SkillCard, type SkillWithProgress } from './SkillCard';
import { SkillConstellation } from './SkillConstellation';
import { SkillDetailModal } from './SkillDetailModal';

type SkillAnswerHighlight = {
  skill_key: string | null;
  question: string;
  score: number | null;
};

export function SkillTreeClient({
  skills,
  answerHighlights,
}: {
  skills: SkillWithProgress[];
  answerHighlights: SkillAnswerHighlight[];
}) {
  const [activeTab, setActiveTab] = useState<SkillTab>('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillWithProgress | null>(null);

  const filteredSkills = useMemo(
    () => filterSkillsByTab(activeTab),
    [activeTab]
  );

  const visibleSkills = useMemo(
    () =>
      skills.filter((skill) =>
        filteredSkills.some((filtered) => filtered.key === skill.key)
      ),
    [skills, filteredSkills]
  );

  const totalSkillXp = skills.reduce((sum, skill) => sum + skill.xp, 0);
  const overallLevel = getOverallNurseLevel(totalSkillXp);

  const strengthsForSkill = useMemo(() => {
    if (!selectedSkill) return [];
    return answerHighlights
      .filter(
        (answer) =>
          answer.skill_key === selectedSkill.key &&
          answer.score != null &&
          answer.score >= 70
      )
      .slice(0, 4)
      .map((answer) => ({
        question: answer.question,
        score: Math.round(answer.score || 0),
      }));
  }, [answerHighlights, selectedSkill]);

  return (
    <PageTransition>
      <motion.div className="space-y-10">
        <header className="rounded-[28px] border border-purple-50 bg-white p-8 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Growth system
          </p>
          <h1 className="mt-2 text-4xl font-black text-text-primary md:text-5xl">
            Skill Tree 🌳
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-text-secondary">
            Master every clinical competency before your interview
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="rounded-pill bg-purple-gradient px-5 py-2 text-sm font-black text-white shadow-button">
              Overall: Level {overallLevel} Nurse
            </span>
            <span className="rounded-pill border border-border bg-input px-5 py-2 text-sm font-bold text-text-primary">
              {totalSkillXp.toLocaleString()} total skill XP earned
            </span>
          </div>
        </header>

        <div className="relative border-b border-border">
          <div className="flex flex-wrap gap-2">
            {SKILL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative px-4 py-3 text-sm font-bold transition-colors',
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="skill-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleSkills.map((skill, index) => (
            <SkillCard
              key={skill.key}
              skill={skill}
              index={index}
              onSelect={setSelectedSkill}
            />
          ))}
        </motion.div>

        <SkillConstellation skills={skills} />

        <SkillDetailModal
          skill={selectedSkill}
          strengths={strengthsForSkill}
          onClose={() => setSelectedSkill(null)}
        />
      </motion.div>
    </PageTransition>
  );
}
