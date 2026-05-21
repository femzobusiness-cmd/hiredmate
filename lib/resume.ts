export const RESUME_SPECIALTIES = [
  'General',
  'ICU',
  'ED',
  'Med-Surg',
  'L&D',
  'OR',
  'Oncology',
  'Psych',
  'Pediatrics',
  'Travel',
] as const;

export type ResumeSpecialty = (typeof RESUME_SPECIALTIES)[number];

export const EXPERIENCE_OPTIONS = [
  'New Grad',
  '1-2 years',
  '3-5 years',
  '5-10 years',
  '10+ years',
] as const;

export const DEGREE_OPTIONS = ['ADN', 'BSN', 'MSN', 'DNP', 'Other'] as const;

export const CERTIFICATION_OPTIONS = [
  'RN License',
  'BLS',
  'ACLS',
  'PALS',
  'TNCC',
  'CEN (Certified Emergency Nurse)',
  'CCRN (Critical Care RN)',
  'OCN (Oncology Certified Nurse)',
  'NRP',
  'NIHSS',
] as const;

export const CLINICAL_SKILLS: Record<string, string[]> = {
  Assessment: [
    'Head-to-toe assessment',
    'Vital signs interpretation',
    'Pain assessment',
  ],
  Procedures: [
    'IV insertion',
    'Foley catheter',
    'NG tube',
    'Wound care',
    'Blood transfusion',
  ],
  Technology: [
    'Epic EMR',
    'Meditech',
    'Cerner',
    'Pyxis',
    'IV pumps',
    'Ventilator management',
  ],
  Specialties: [
    'Telemetry monitoring',
    'Chemotherapy administration',
    'Labor support',
    'Surgical scrubbing',
  ],
};

export const SOFT_SKILLS = [
  'Patient advocacy',
  'Team collaboration',
  'Critical thinking',
  'Time management',
  'Patient education',
  'Charge nurse experience',
  'Precepting',
  'Quality improvement',
  'Bilingual',
] as const;

export const ATS_TARGET_OPTIONS = [
  'Hospital (inpatient)',
  'Outpatient / Clinic',
  'Travel Nursing',
  'Leadership / Charge',
  'Education / Academia',
] as const;

export type ResumeFormat = 'classic' | 'modern';

export interface WorkExperienceEntry {
  id: string;
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
  unit: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  schoolName: string;
  graduationYear: string;
  gpa: string;
  honors: string;
}

export interface ResumeFormData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    targetRole: string;
    specialty: ResumeSpecialty;
    yearsExperience: string;
    summaryPreference: 'ai' | 'own';
    ownSummary: string;
    /** Data URL (base64) for optional profile headshot */
    headshotBase64: string | null;
  };
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  otherCertifications: string;
  clinicalSkills: string[];
  softSkills: string[];
  bilingualLanguage: string;
  atsTarget: string;
  format: ResumeFormat;
}

export interface GeneratedResumeContent {
  professionalSummary: string;
  workExperience: {
    jobTitle: string;
    employer: string;
    location: string;
    startDate: string;
    endDate: string;
    unit: string;
    bullets: string[];
  }[];
  education?: {
    degree: string;
    schoolName: string;
    graduationYear: string;
    gpa?: string;
    honors?: string;
  }[];
  certifications?: string[];
  clinicalSkills?: string[];
  softSkills?: string[];
  atsKeywords: string[];
  atsScore: number;
  atsTips: string[];
}

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createEmptyWorkEntry(): WorkExperienceEntry {
  return {
    id: newId(),
    jobTitle: '',
    employer: '',
    location: '',
    startDate: '',
    endDate: '',
    isPresent: false,
    unit: '',
    bullets: ['', '', ''],
  };
}

export function createEmptyEducationEntry(): EducationEntry {
  return {
    id: newId(),
    degree: 'BSN',
    schoolName: '',
    graduationYear: '',
    gpa: '',
    honors: '',
  };
}

export function defaultResumeFormData(): ResumeFormData {
  return {
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      targetRole: '',
      specialty: 'General',
      yearsExperience: 'New Grad',
      summaryPreference: 'ai',
      ownSummary: '',
      headshotBase64: null,
    },
    workExperience: [],
    education: [createEmptyEducationEntry()],
    certifications: [],
    otherCertifications: '',
    clinicalSkills: [],
    softSkills: [],
    bilingualLanguage: '',
    atsTarget: 'Hospital (inpatient)',
    format: 'classic',
  };
}

export function computeDisplayAtsScore(
  generated: GeneratedResumeContent | null,
  formData: ResumeFormData | null
): number {
  if (generated?.atsScore != null) return generated.atsScore;
  if (!generated) return 0;
  const text = JSON.stringify(generated).toLowerCase();
  const keywords = generated.atsKeywords || [];
  if (keywords.length === 0) return 65;
  const found = keywords.filter((k) => text.includes(k.toLowerCase())).length;
  return Math.min(100, Math.round((found / keywords.length) * 100));
}

export function atsScoreColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#7C5CBF';
  return '#EF4444';
}
