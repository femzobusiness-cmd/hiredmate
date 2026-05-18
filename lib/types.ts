export type Specialty =
  | 'ICU'
  | 'ER'
  | 'Med-Surg'
  | 'L&D'
  | 'Oncology'
  | 'Pediatrics'
  | 'OR/Surgical'
  | 'Psych'
  | 'Travel Nurse'
  | 'Other';

export type ExperienceLevel =
  | 'New Graduate'
  | 'Early Career (1-3yr)'
  | 'Experienced (3yr+)'
  | 'Travel Nurse';

export type InterviewTimeline =
  | 'Today/Tomorrow'
  | 'This Week'
  | 'Within a Month'
  | 'Just Exploring';

export type BiggestFear =
  | 'Clinical scenario questions'
  | 'Behavioral questions'
  | 'Salary negotiation'
  | 'Explaining resume gaps'
  | 'New grad with no experience'
  | 'Switching specialties';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  specialty: Specialty | null;
  experience_level: ExperienceLevel | null;
  hospital_name: string | null;
  job_title: string | null;
  interview_timeline: InterviewTimeline | null;
  interview_date: string | null;
  biggest_fears: BiggestFear[] | null;
  resume_url: string | null;
  resume_text: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  title: string;
  score: number | null;
  questions_count: number;
  created_at: string;
}

export interface OnboardingData {
  specialty: Specialty;
  experienceLevel: ExperienceLevel;
  hospitalName: string;
  jobTitle: string;
  interviewTimeline: InterviewTimeline;
  biggestFears: BiggestFear[];
  resumeUrl: string | null;
  resumeText: string | null;
}
