import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yeocrioblbcucfbvaeav.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb2NyaW9ibGJjdWNmYnZhZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTgzNzcsImV4cCI6MjA1ODY5NDM3N30.JMtCn8cfuwECYXcQgKH_PApHUlrGVuGaJxidyxzlJYQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Updated type definitions to match the database schema exactly
export type Profile = {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  rating: number;
  created_at: string;
  updated_at?: string;
};

export type Battle = {
  id: string;
  creator_id: string;
  defender_id: string | null;
  problem_id: number;
  programming_language: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  battle_type: 'Rated' | 'Casual';
  status: 'open' | 'in_progress' | 'completed';
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
};

// Update Submission type to make feedback and score nullable
export type Submission = {
  id: string;
  battle_id: string;
  user_id: string;
  code: string;
  language: string;
  status: 'pending' | 'correct' | 'incorrect' | 'evaluated';
  submitted_at: string;
  score: number | null;  // Make nullable to match DB schema
  feedback: string | null; // Make nullable to match DB schema
  evaluated_at: string | null;
};

// Adding a Solution type that was used in BattleArena.tsx but wasn't defined
export type Solution = {
  id: string;
  battle_id: string;
  user_id: string;
  code: string;
  submitted_at: string;
};
