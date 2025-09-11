import { supabase } from './supabase';

export interface HelpShoutout {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  tour_id?: string;
  category: 'feature' | 'improvement' | 'announcement' | 'bugfix';
  priority: 'low' | 'medium' | 'high';
  language: 'en' | 'sv';
  target_group: 'public' | 'authenticated' | 'admin';
  release_date: string;
  expire_date?: string;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface HelpTour {
  id: string;
  name: string;
  description?: string;
  category: 'onboarding' | 'feature' | 'admin' | 'user';
  required_role: 'admin' | 'user' | 'any';
  target_group: 'public' | 'authenticated' | 'admin';
  estimated_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface HelpTourStep {
  id: string;
  tour_id: string;
  step_order: number;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'wait' | 'navigate' | 'scroll';
  action_target?: string;
  action_data?: any;
  wait_time?: number;
  required_view?: string;
  skip_if_not_found: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpContent {
  id: string;
  title: string;
  content: string;
  category?: string;
  language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface UserInteraction {
  id: string;
  user_id?: string;
  interaction_type: string;
  target_id?: string;
  metadata?: any;
  created_at: string;
}

class HelpSystemService {
  // Shoutouts
  async getShoutouts(language: 'en' | 'sv' = 'en'): Promise<HelpShoutout[]> {
    try {
      const { data, error } = await supabase
        .from('help_shoutouts')
        .select('*')
        .eq('is_active', true)
        .eq('language', language)
        .order('release_date', { ascending: false });

      if (error) {
        console.error('Error fetching shoutouts:', error);
        return [];
      }

      // Filter out expired shoutouts
      const currentDate = new Date().toISOString().split('T')[0];
      return data?.filter(shoutout => {
        if (!shoutout.expire_date) return true;
        return shoutout.expire_date >= currentDate;
      }) || [];
    } catch (error) {
      console.error('Error fetching shoutouts:', error);
      return [];
    }
  }

  async createShoutout(shoutout: Omit<HelpShoutout, 'id' | 'created_at' | 'updated_at'>): Promise<HelpShoutout | null> {
    try {
      const { data, error } = await supabase
        .from('help_shoutouts')
        .insert([shoutout])
        .select()
        .single();

      if (error) {
        console.error('Error creating shoutout:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating shoutout:', error);
      return null;
    }
  }

  async updateShoutout(id: string, shoutout: Partial<HelpShoutout>): Promise<HelpShoutout | null> {
    try {
      const { data, error } = await supabase
        .from('help_shoutouts')
        .update({ ...shoutout, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating shoutout:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating shoutout:', error);
      return null;
    }
  }

  async deleteShoutout(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('help_shoutouts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shoutout:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting shoutout:', error);
      return false;
    }
  }

  // Tours
  async getTours(): Promise<HelpTour[]> {
    try {
      const { data, error } = await supabase
        .from('help_tours')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching tours:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tours:', error);
      return [];
    }
  }

  async getTourSteps(tourId: string): Promise<HelpTourStep[]> {
    try {
      const { data, error } = await supabase
        .from('help_tour_steps')
        .select('*')
        .eq('tour_id', tourId)
        .order('step_order');

      if (error) {
        console.error('Error fetching tour steps:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tour steps:', error);
      return [];
    }
  }

  async createTour(tour: Omit<HelpTour, 'created_at' | 'updated_at'>): Promise<HelpTour | null> {
    try {
      const { data, error } = await supabase
        .from('help_tours')
        .insert([tour])
        .select()
        .single();

      if (error) {
        console.error('Error creating tour:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating tour:', error);
      return null;
    }
  }

  async updateTour(id: string, tour: Partial<HelpTour>): Promise<HelpTour | null> {
    try {
      const { data, error } = await supabase
        .from('help_tours')
        .update({ ...tour, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tour:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating tour:', error);
      return null;
    }
  }

  async deleteTour(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('help_tours')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tour:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting tour:', error);
      return false;
    }
  }

  // Tour Steps
  async createTourStep(step: Omit<HelpTourStep, 'id' | 'created_at' | 'updated_at'>): Promise<HelpTourStep | null> {
    try {
      const { data, error } = await supabase
        .from('help_tour_steps')
        .insert([step])
        .select()
        .single();

      if (error) {
        console.error('Error creating tour step:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating tour step:', error);
      return null;
    }
  }

  async updateTourStep(id: string, step: Partial<HelpTourStep>): Promise<HelpTourStep | null> {
    try {
      const { data, error } = await supabase
        .from('help_tour_steps')
        .update({ ...step, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tour step:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating tour step:', error);
      return null;
    }
  }

  async deleteTourStep(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('help_tour_steps')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tour step:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting tour step:', error);
      return false;
    }
  }

  // Help Content
  async getHelpContent(category?: string, language: string = 'en'): Promise<HelpContent[]> {
    try {
      let query = supabase
        .from('help_content')
        .select('*')
        .eq('is_active', true)
        .eq('language', language)
        .order('title');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching help content:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching help content:', error);
      return [];
    }
  }

  // User Interactions
  async recordInteraction(interaction: Omit<UserInteraction, 'id' | 'created_at'>): Promise<UserInteraction | null> {
    try {
      const { data, error } = await supabase
        .from('help_user_interactions')
        .insert([interaction])
        .select()
        .single();

      if (error) {
        console.error('Error recording interaction:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error recording interaction:', error);
      return null;
    }
  }

  async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    try {
      const { data, error } = await supabase
        .from('help_user_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user interactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      return [];
    }
  }
}

export const helpSystemService = new HelpSystemService();
