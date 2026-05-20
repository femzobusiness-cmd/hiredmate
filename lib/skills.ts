export type SkillCategory = 'core' | 'safety' | 'emergency' | 'soft' | 'specialty';

export type SkillDefinition = {
  key: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  lightColor: string;
  maxLevel: number;
  xpPerLevel: number;
  category: SkillCategory;
  relatedSpecialties: string[];
};

export const SKILLS: SkillDefinition[] = [
  {
    key: 'clinical_judgment',
    name: 'Clinical Judgment',
    icon: '🧠',
    description:
      'Assess and interpret complex patient situations',
    color: '#7C5CBF',
    lightColor: '#EDE9F7',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'core',
    relatedSpecialties: ['ICU', 'ER', 'Med-Surg'],
  },
  {
    key: 'patient_prioritization',
    name: 'Patient Prioritization',
    icon: '⚡',
    description: 'Triage and prioritize multiple patient needs',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'core',
    relatedSpecialties: ['ER', 'ICU', 'Med-Surg'],
  },
  {
    key: 'medication_safety',
    name: 'Medication Safety',
    icon: '💊',
    description:
      'Safe medication administration and error prevention',
    color: '#EF4444',
    lightColor: '#FEE2E2',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'safety',
    relatedSpecialties: ['All'],
  },
  {
    key: 'emergency_response',
    name: 'Emergency Response',
    icon: '🚨',
    description: 'Handle codes, rapid response, and emergencies',
    color: '#EF4444',
    lightColor: '#FEE2E2',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'emergency',
    relatedSpecialties: ['ICU', 'ER'],
  },
  {
    key: 'communication',
    name: 'Communication',
    icon: '💬',
    description: 'SBAR, handoffs, patient and family communication',
    color: '#00C6B2',
    lightColor: '#E0F7F5',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'soft',
    relatedSpecialties: ['All'],
  },
  {
    key: 'documentation',
    name: 'Documentation',
    icon: '📋',
    description: 'Accurate charting and legal documentation',
    color: '#6366F1',
    lightColor: '#EEF2FF',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'core',
    relatedSpecialties: ['All'],
  },
  {
    key: 'team_collaboration',
    name: 'Team Collaboration',
    icon: '🤝',
    description: 'Work effectively with interdisciplinary teams',
    color: '#10B981',
    lightColor: '#D1FAE5',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'soft',
    relatedSpecialties: ['All'],
  },
  {
    key: 'patient_education',
    name: 'Patient Education',
    icon: '📚',
    description:
      'Teach patients and families about conditions and care',
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'soft',
    relatedSpecialties: ['All'],
  },
  {
    key: 'critical_thinking',
    name: 'Critical Thinking',
    icon: '🔬',
    description: 'Analyze complex clinical situations logically',
    color: '#EC4899',
    lightColor: '#FCE7F3',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'core',
    relatedSpecialties: ['ICU', 'ER', 'OR'],
  },
  {
    key: 'icu_confidence',
    name: 'ICU Confidence',
    icon: '💪',
    description: 'Advanced critical care skills and procedures',
    color: '#7C5CBF',
    lightColor: '#EDE9F7',
    maxLevel: 10,
    xpPerLevel: 100,
    category: 'specialty',
    relatedSpecialties: ['ICU'],
  },
];

export const SKILL_KEYS = SKILLS.map((skill) => skill.key);

export const SKILL_CONNECTIONS: [string, string][] = [
  ['clinical_judgment', 'critical_thinking'],
  ['clinical_judgment', 'patient_prioritization'],
  ['patient_prioritization', 'emergency_response'],
  ['emergency_response', 'medication_safety'],
  ['communication', 'team_collaboration'],
  ['communication', 'patient_education'],
  ['documentation', 'medication_safety'],
  ['critical_thinking', 'icu_confidence'],
  ['clinical_judgment', 'icu_confidence'],
  ['team_collaboration', 'patient_education'],
];

export type SkillTab = 'all' | 'core' | 'safety' | 'soft';

export const SKILL_TABS: { id: SkillTab; label: string }[] = [
  { id: 'all', label: 'All Skills' },
  { id: 'core', label: 'Core' },
  { id: 'safety', label: 'Safety' },
  { id: 'soft', label: 'Soft Skills' },
];

export function getSkillByKey(key: string) {
  return SKILLS.find((skill) => skill.key === key);
}

export function getSkillLevel(xp: number) {
  return Math.min(10, Math.floor(xp / 100) + 1);
}

export function getSkillProgress(xp: number) {
  const level = getSkillLevel(xp);
  const xpInLevel = xp % 100;
  return { level, xpInLevel, xpToNext: 100 - xpInLevel };
}

export function getSkillXpForScore(score: number) {
  if (score >= 90) return 20;
  if (score >= 70) return 10;
  if (score >= 50) return 5;
  return 2;
}

export function inferSkillKey(text: string, fallback = 'clinical_judgment') {
  const lower = text.toLowerCase();
  for (const skill of SKILLS) {
    const keywords = [
      skill.key.replace(/_/g, ' '),
      ...skill.name.toLowerCase().split(' '),
    ];
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return skill.key;
    }
  }
  return fallback;
}

export function filterSkillsByTab(tab: SkillTab) {
  if (tab === 'all') return SKILLS;
  if (tab === 'core') {
    return SKILLS.filter((skill) => skill.category === 'core');
  }
  if (tab === 'safety') {
    return SKILLS.filter(
      (skill) => skill.category === 'safety' || skill.category === 'emergency'
    );
  }
  return SKILLS.filter((skill) => skill.category === 'soft');
}

export function getOverallNurseLevel(totalSkillXp: number) {
  const avgXp = totalSkillXp / SKILLS.length;
  return getSkillLevel(avgXp);
}

export function getCategoryLabel(category: SkillCategory) {
  switch (category) {
    case 'core':
      return 'Core';
    case 'safety':
      return 'Safety';
    case 'emergency':
      return 'Emergency';
    case 'soft':
      return 'Soft Skill';
    case 'specialty':
      return 'Specialty';
    default:
      return 'Skill';
  }
}
