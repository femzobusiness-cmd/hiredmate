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
          plan: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          sound_effects_enabled: boolean;
          rank_title: string;
          rank_level: number;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          last_practice_date: string | null;
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
          plan?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          sound_effects_enabled?: boolean;
          rank_title?: string;
          rank_level?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string | null;
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
          plan?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          sound_effects_enabled?: boolean;
          rank_title?: string;
          rank_level?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string | null;
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
          skill_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question: string;
          answer?: string | null;
          score?: number | null;
          feedback?: string | null;
          skill_key?: string | null;
          created_at?: string;
        };
        Update: {
          answer?: string | null;
          score?: number | null;
          feedback?: string | null;
          skill_key?: string | null;
        };
      };
      skill_progress: {
        Row: {
          id: string;
          user_id: string;
          skill_key: string;
          xp: number;
          level: number;
          sessions_count: number;
          avg_score: number;
          last_practiced: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_key: string;
          xp?: number;
          level?: number;
          sessions_count?: number;
          avg_score?: number;
          last_practiced?: string | null;
          created_at?: string;
        };
        Update: {
          skill_key?: string;
          xp?: number;
          level?: number;
          sessions_count?: number;
          avg_score?: number;
          last_practiced?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_key: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_key: string;
          earned_at?: string;
        };
        Update: {
          achievement_key?: string;
          earned_at?: string;
        };
      };
      quests: {
        Row: {
          id: string;
          key: string;
          title: string;
          description: string;
          quest_type: string;
          frequency: string;
          xp_reward: number;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          specialty_filter: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          title: string;
          description: string;
          quest_type: string;
          frequency: string;
          xp_reward: number;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          specialty_filter?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          quest_type?: string;
          frequency?: string;
          xp_reward?: number;
          icon?: string;
          requirement_type?: string;
          requirement_value?: number;
          specialty_filter?: string | null;
        };
      };
      worlds: {
        Row: {
          id: string;
          key: string;
          title: string;
          description: string;
          icon: string;
          color: string;
          gradient: string;
          order_index: number;
          required_level: number;
          total_stages: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          title: string;
          description: string;
          icon: string;
          color: string;
          gradient: string;
          order_index: number;
          required_level?: number;
          total_stages: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          icon?: string;
          color?: string;
          gradient?: string;
          order_index?: number;
          required_level?: number;
          total_stages?: number;
        };
      };
      stages: {
        Row: {
          id: string;
          world_key: string;
          key: string;
          title: string;
          description: string;
          stage_number: number;
          stage_type: string;
          xp_reward: number;
          questions_count: number;
          passing_score: number;
          is_boss_stage: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          world_key: string;
          key: string;
          title: string;
          description: string;
          stage_number: number;
          stage_type: string;
          xp_reward: number;
          questions_count?: number;
          passing_score?: number;
          is_boss_stage?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          stage_number?: number;
          stage_type?: string;
          xp_reward?: number;
          questions_count?: number;
          passing_score?: number;
          is_boss_stage?: boolean;
        };
      };
      user_stage_progress: {
        Row: {
          id: string;
          user_id: string;
          stage_key: string;
          world_key: string;
          completed: boolean;
          best_score: number;
          attempts: number;
          stars: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stage_key: string;
          world_key: string;
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          stars?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          stars?: number;
          completed_at?: string | null;
        };
      };
      user_quest_progress: {
        Row: {
          id: string;
          user_id: string;
          quest_key: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
          period_start: string;
          xp_claimed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_key: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          period_start: string;
          xp_claimed?: boolean;
          created_at?: string;
        };
        Update: {
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          xp_claimed?: boolean;
        };
      };
      voice_sessions: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          transcript: string | null;
          duration_seconds: number | null;
          word_count: number | null;
          words_per_minute: number | null;
          filler_word_count: number | null;
          filler_words_found: Json | null;
          overall_score: number | null;
          pace_rating: string | null;
          analysis: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          transcript?: string | null;
          duration_seconds?: number | null;
          word_count?: number | null;
          words_per_minute?: number | null;
          filler_word_count?: number | null;
          filler_words_found?: Json | null;
          overall_score?: number | null;
          pace_rating?: string | null;
          analysis?: Json | null;
          created_at?: string;
        };
        Update: {
          question?: string;
          transcript?: string | null;
          duration_seconds?: number | null;
          word_count?: number | null;
          words_per_minute?: number | null;
          filler_word_count?: number | null;
          filler_words_found?: Json | null;
          overall_score?: number | null;
          pace_rating?: string | null;
          analysis?: Json | null;
        };
      };
      mock_interviews: {
        Row: {
          id: string;
          user_id: string;
          personality_mode: string;
          specialty: string | null;
          hospital_id: string | null;
          conversation: Json;
          debrief: Json | null;
          overall_score: number | null;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          personality_mode: string;
          specialty?: string | null;
          hospital_id?: string | null;
          conversation?: Json;
          debrief?: Json | null;
          overall_score?: number | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          personality_mode?: string;
          specialty?: string | null;
          hospital_id?: string | null;
          conversation?: Json;
          debrief?: Json | null;
          overall_score?: number | null;
          duration_seconds?: number | null;
        };
      };
    };
  };
}
