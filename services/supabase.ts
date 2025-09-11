import { createClient } from '@supabase/supabase-js';

// Get environment variables - no fallbacks for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
} else {
  console.log('Supabase configured with URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database table types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          voucher_balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          voucher_balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          voucher_balance?: number;
          created_at?: string;
        };
      };
      trainings: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          training_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          training_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          training_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          training_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          training_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          training_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

