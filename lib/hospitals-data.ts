export type SalaryByRole = {
  role: string;
  min: number;
  max: number;
  unit: string;
};

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  location: string;
  type: string;
  tagline: string;
  culture: string[];
  interviewStyle: string;
  interviewerPersonality: string;
  knownQuestionPatterns: string[];
  salaryByRole: SalaryByRole[];
  specialties: string[];
  unitExpectations: string[];
  insiderTips: string[];
  badgeText: string;
  promptContext: string;
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'mayo-clinic',
    name: 'Mayo Clinic',
    shortName: 'Mayo',
    emoji: '🏥',
    bgColor: '#003DA5',
    gradientFrom: '#003DA5',
    gradientTo: '#0057C2',
    location: 'Rochester, MN · Phoenix, AZ · Jacksonville, FL',
    type: 'Academic Medical Center',
    tagline: 'The needs of the patient come first',
    culture: [
      'Team-based care is paramount',
      'Evidence-based practice is non-negotiable',
      'Patient experience scores are taken seriously',
      'Shared governance initiatives are valued',
      'Highly structured, process-driven environment',
    ],
    interviewStyle:
      'Behavioral STAR format with heavy emphasis on teamwork and patient advocacy',
    interviewerPersonality:
      'Professional, methodical, and warm. Panel of 2–3 interviewers. They probe deeply on collaboration and how you advocate for patients.',
    knownQuestionPatterns: [
      'Tell me about a time you advocated for a patient against a physician recommendation.',
      'Describe when you caught a medication error before it reached the patient.',
      'How did you handle a disagreement with a colleague mid-shift?',
      'What is your experience with shared governance or committee work?',
      'How do you approach a non-compliant patient while maintaining rapport?',
    ],
    salaryByRole: [
      { role: 'New Grad', min: 32, max: 38, unit: 'hr' },
      { role: 'Staff RN (2–5 yrs)', min: 38, max: 48, unit: 'hr' },
      { role: 'Charge Nurse', min: 48, max: 58, unit: 'hr' },
      { role: 'ICU', min: 45, max: 60, unit: 'hr' },
    ],
    specialties: ['Oncology', 'Transplant', 'Neurology', 'Cardiology', 'Rare Diseases'],
    unitExpectations: [
      '4:1 med-surg and 2:1 ICU ratios',
      'Epic proficiency expected',
      'Annual CE beyond state minimum',
      'QI participation encouraged',
      'BSN preferred; MSN encouraged',
    ],
    insiderTips: [
      'Research the Mayo Model of Care and reference it in your answers',
      'Mention Magnet designation and what it means to your practice',
      'Never speak negatively about a past employer',
      'Prepare a story about going above and beyond for a patient family',
    ],
    badgeText: 'Mayo Clinic Mode',
    promptContext:
      "You are generating nursing interview questions for Mayo Clinic. Mayo Clinic is a world-renowned academic medical center known for team-based care, evidence-based practice, and exceptional patient experience. Key values: collaboration, patient advocacy, continuous learning, shared governance. Interview style: Behavioral STAR with emphasis on teamwork, patient advocacy, quality improvement. Generate realistic challenging questions reflecting Mayo's patient-first philosophy and collaborative culture.",
  },
  {
    id: 'cleveland-clinic',
    name: 'Cleveland Clinic',
    shortName: 'Cleveland Clinic',
    emoji: '🫀',
    bgColor: '#0A4C8B',
    gradientFrom: '#0A4C8B',
    gradientTo: '#1565C0',
    location: 'Cleveland, OH · Florida · Abu Dhabi · London',
    type: 'Academic Medical Center',
    tagline: 'Patients first',
    culture: [
      'Ranked #2 nationally for cardiology',
      'Innovation-driven; new technology embraced quickly',
      'Interdisciplinary rounds with nursing participation',
      'High acuity — critical thinking is paramount',
      'Flat hierarchy; nurse voice is valued',
    ],
    interviewStyle:
      'Competency-based mix of situational and behavioral questions with heavy clinical judgment focus',
    interviewerPersonality:
      'Direct and clinically focused. They want to see your thought process out loud. Expect clinical scenarios alongside behavioral questions.',
    knownQuestionPatterns: [
      'Walk me through your assessment of a patient with sudden onset chest pain.',
      'Tell me about a time you identified a deteriorating patient before others noticed.',
      'You have five patients and three need attention — how do you prioritize?',
      'Describe your experience with rapid response or code situations.',
      'What does "patients first" mean to you in daily nursing practice?',
    ],
    salaryByRole: [
      { role: 'New Grad', min: 31, max: 36, unit: 'hr' },
      { role: 'Staff RN (2–5 yrs)', min: 36, max: 47, unit: 'hr' },
      { role: 'Charge Nurse', min: 47, max: 57, unit: 'hr' },
      { role: 'Cardiac Care', min: 44, max: 59, unit: 'hr' },
    ],
    specialties: [
      'Cardiology',
      'Heart Failure',
      'Cardiac Surgery',
      'Neuroscience',
      'Cancer',
    ],
    unitExpectations: [
      'Epic proficiency required',
      'BSN required; MSN preferred for specialty units',
      'Interdisciplinary rounds daily',
      'Quality metrics are transparent to staff',
      'High volume, high acuity adaptability required',
    ],
    insiderTips: [
      'Know the Caregiver philosophy — everyone is a caregiver',
      'Cardiac experience is a major differentiator',
      'Ask thoughtful questions about protocols and escalation',
      'Bring data or metrics from patient outcome improvements',
    ],
    badgeText: 'Cleveland Clinic Mode',
    promptContext:
      'You are generating nursing interview questions for Cleveland Clinic. Top-ranked academic medical center known for cardiac care, innovation, and interdisciplinary collaboration. Key values: critical thinking, clinical excellence, innovation, caregiver philosophy. Interview style: Competency-based with clinical scenarios. Focus on prioritization under pressure, clinical judgment, and early identification of deterioration.',
  },
  {
    id: 'northwestern',
    name: 'Northwestern Medicine',
    shortName: 'Northwestern',
    emoji: '🟣',
    bgColor: '#4E2A84',
    gradientFrom: '#4E2A84',
    gradientTo: '#7C3F9E',
    location: 'Chicago, IL',
    type: 'Academic Medical Center',
    tagline: 'Superior quality, patient-centered care',
    culture: [
      'Academic research integration in daily practice',
      'Magnet-designated; shared governance deeply embedded',
      'Diverse urban Chicago patient population',
      'Cultural competency and health equity emphasis',
      'Regularly precepts students and new graduates',
    ],
    interviewStyle:
      'Behavioral with equity and cultural competency components; panel interviews common for specialty units',
    interviewerPersonality:
      'Collaborative and academic. They appreciate intellectual curiosity and genuine commitment to health equity.',
    knownQuestionPatterns: [
      'Describe caring for a patient from a different cultural background than your own.',
      'Tell me about contributing to evidence-based practice changes on your unit.',
      'What is your precepting or mentoring experience?',
      'How did you handle a patient family in conflict with the care team?',
      'Describe a quality improvement project you participated in.',
    ],
    salaryByRole: [
      { role: 'New Grad', min: 33, max: 39, unit: 'hr' },
      { role: 'Staff RN (2–5 yrs)', min: 39, max: 50, unit: 'hr' },
      { role: 'Charge Nurse', min: 50, max: 60, unit: 'hr' },
      { role: 'Specialty RN', min: 46, max: 62, unit: 'hr' },
    ],
    specialties: [
      'Oncology',
      'Transplant',
      'Neurosurgery',
      'Labor & Delivery',
      'Psychiatry',
    ],
    unitExpectations: [
      'BSN required; MSN preferred for leadership tracks',
      'Shared governance committee participation expected',
      'Northwestern Epic workflows',
      'Urban population with complex social determinants',
      'Precepting expected within first year',
    ],
    insiderTips: [
      'Diversity and health equity discussions are valued — prepare examples',
      'Reference what Magnet and shared governance mean to you',
      'Salary negotiation is acceptable given Chicago cost of living',
      'Research interest or publications are a differentiator',
    ],
    badgeText: 'Northwestern Mode',
    promptContext:
      'You are generating nursing interview questions for Northwestern Medicine. Magnet-designated academic medical center with research integration and commitment to health equity. Key values: academic excellence, cultural competency, shared governance, health equity, professional development. Generate questions exploring approach to diverse urban populations, evidence-based practice engagement, and shared governance interest.',
  },
  {
    id: 'hca',
    name: 'HCA Healthcare',
    shortName: 'HCA',
    emoji: '🏨',
    bgColor: '#C62828',
    gradientFrom: '#C62828',
    gradientTo: '#E53935',
    location: 'Nationwide — 180+ hospitals',
    type: 'For-Profit Health System',
    tagline:
      'Above all else, we are committed to the care and improvement of human life',
    culture: [
      'Efficiency and throughput are key metrics',
      'Entrepreneurial culture with fast leadership paths',
      'Robust nurse residency programs',
      'Technology-forward; early adopters of new tools',
      'Performance-based advancement within 1–2 years',
    ],
    interviewStyle:
      'Conversational and competency-based; less formal than academic centers; focus on adaptability and efficiency',
    interviewerPersonality:
      'Practical and efficiency-minded. They want to know you can hit the ground running on a busy floor.',
    knownQuestionPatterns: [
      'How do you manage your time when your assignment is heavier than expected?',
      'Tell me about adapting quickly to a sudden protocol change.',
      'How do you handle a demanding or aggressive patient or family member?',
      'Describe helping improve patient throughput or discharge flow.',
      'Where do you see yourself in five years, and how does HCA fit?',
    ],
    salaryByRole: [
      { role: 'New Grad', min: 28, max: 35, unit: 'hr' },
      { role: 'Staff RN (2–5 yrs)', min: 33, max: 44, unit: 'hr' },
      { role: 'Charge Nurse', min: 42, max: 52, unit: 'hr' },
      { role: 'Travel (via HCA)', min: 55, max: 75, unit: 'hr' },
    ],
    specialties: [
      'Emergency Medicine',
      'Med-Surg',
      'ICU',
      'Labor & Delivery',
      'Orthopedics',
    ],
    unitExpectations: [
      '5:1 or 6:1 med-surg ratios common',
      'Fast-paced efficiency valued',
      'Meditech or Epic varies by facility',
      'Float pool and internal travel common',
      'Leadership tracks after 1–2 years',
    ],
    insiderTips: [
      'Strong system for building high-volume experience quickly',
      'Ask about their Nurse Residency program — they are proud of it',
      'Career ambition impresses interviewers',
      'Salary is negotiable with competing offers',
    ],
    badgeText: 'HCA Mode',
    promptContext:
      'You are generating nursing interview questions for HCA Healthcare. Largest for-profit hospital system in the US with 180+ hospitals. Key values: efficiency, adaptability, high patient volume management, career growth. Interview style: Conversational competency-based. Focus on time management under pressure, adapting to change, managing high patient loads, and career goals within a large health system.',
  },
  {
    id: 'kaiser',
    name: 'Kaiser Permanente',
    shortName: 'Kaiser',
    emoji: '💙',
    bgColor: '#005B8E',
    gradientFrom: '#005B8E',
    gradientTo: '#0080C7',
    location: 'CA · OR · WA · CO · GA · MD · VA · HI',
    type: 'Integrated Health System / HMO',
    tagline: 'Thrive',
    culture: [
      'Integrated care model in a closed system',
      'Strong union (SEIU-UHW) with significant protections',
      'Prevention and population health mindset',
      'Diverse workforce is core to identity',
      'Work-life balance protected by union contracts',
    ],
    interviewStyle:
      'Values-based and behavioral; mission alignment and health equity are central',
    interviewerPersonality:
      'Mission-driven and warm. They want nurses who genuinely believe in preventive care and health equity.',
    knownQuestionPatterns: [
      'Why Kaiser specifically over other health systems?',
      'How do you care for a patient when there is a language or cultural barrier?',
      'Describe your population health or preventive care experience.',
      'Tell me about navigating union guidelines vs. management priorities.',
      'How have you contributed to health equity in a previous role?',
    ],
    salaryByRole: [
      { role: 'New Grad (CA)', min: 58, max: 68, unit: 'hr' },
      { role: 'Staff RN CA (2–5 yrs)', min: 68, max: 88, unit: 'hr' },
      { role: 'Charge Nurse (CA)', min: 80, max: 100, unit: 'hr' },
      { role: 'New Grad (non-CA)', min: 35, max: 45, unit: 'hr' },
    ],
    specialties: [
      'Primary Care',
      'Oncology',
      'Mental Health',
      'Pediatrics',
      'OB/GYN',
    ],
    unitExpectations: [
      'California nurses among highest compensated nationally',
      'Union membership automatic at most facilities',
      'KP HealthConnect (Epic-based) system-wide',
      'Strong ratio protections under CA AB 394',
      'Generous tuition reimbursement',
    ],
    insiderTips: [
      'Know the Kaiser mission statement — they test alignment',
      'California salaries are dramatically higher than non-CA regions',
      'Community health and prevention themes resonate deeply',
      'Research SEIU-UHW before your interview',
    ],
    badgeText: 'Kaiser Mode',
    promptContext:
      'You are generating nursing interview questions for Kaiser Permanente. Integrated health system HMO known for preventive care, health equity, union protections, and diverse patient populations. Key values: prevention, health equity, diversity, integrated care, community health, work-life balance. Generate questions exploring alignment with preventive care, diverse population experience, health equity commitment, and understanding of the integrated care model.',
  },
];

export function getHospitalById(id: string): Hospital | undefined {
  return HOSPITALS.find((h) => h.id === id);
}

export function formatSalaryRange(row: SalaryByRole): string {
  return `$${row.min}–$${row.max}/${row.unit}`;
}
