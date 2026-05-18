export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          specialty: string | null;
          experience_level: string | null;
          hospital_name: string | null;
          job_title: string | null;
          interview_timeline: string | null;
          interview_date: string | null;
          biggest_fears: string[] | null;
          resume_url: string | null;
          resume_text: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          specialty?: string | null;
          experience_level?: string | null;
          hospital_name?: string | null;
          job_title?: string | null;
          interview_timeline?: string | null;
          interview_date?: string | null;
          biggest_fears?: string[] | null;
          resume_url?: string | null;
          resume_text?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string | null;
          specialty?: string | null;
          experience_level?: string | null;
          hospital_name?: string | null;
          job_title?: string | null;
          interview_timeline?: string | null;
          interview_date?: string | null;
          biggest_fears?: string[] | null;
          resume_url?: string | null;
          resume_text?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          score: number | null;
          questions_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          score?: number | null;
          questions_count?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          score?: number | null;
          questions_count?: number;
        };
      };
      session_answers: {
        Row: {
          id: string;
          session_id: string;
          question: string;
          answer: string | null;
          score: number | null;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question: string;
          answer?: string | null;
          score?: number | null;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          answer?: string | null;
          score?: number | null;
          feedback?: string | null;
        };
      };
    };
  };
}
