import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bumphnqhbbtmlhiwokmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXBobnFoYmJ0bWxoaXdva215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTI4MTMsImV4cCI6MjA3MjAyODgxM30.l9b82y_-e0l293VvBOemT_m60jW_qxxzCcLmhFWaofw';

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

