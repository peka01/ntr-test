import { supabase } from './supabase';
import type { User, Training } from '../types';

// User operations
export const userService = {
  // Get all users
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      voucherBalance: user.voucher_balance
    })) || [];
  },

  // Create a new user (participant/subscriber only - no auth account)
  async create(name: string, email: string): Promise<User> {
    // Generate a unique ID for the user (since we're not using auth.users)
    const userId = crypto.randomUUID();
    
    // Check if a user with this email already exists
    // Use a more robust query to avoid 406 errors
    let existingUser = null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, voucher_balance')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      if (error) {
        console.error('Error checking existing user:', error);
        // Continue with creation instead of throwing error
      } else if (data) {
        existingUser = data;
      }
    } catch (error) {
      console.error('Exception checking existing user:', error);
      // Continue with creation instead of throwing error
    }

    let userData;
    if (existingUser) {
      // User exists, update the existing record
      try {
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ 
            name, 
            voucher_balance: 0 
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating existing user:', updateError);
          throw updateError;
        }
        userData = updateData;
      } catch (error) {
        console.error('Exception updating existing user:', error);
        throw error;
      }
    } else {
      // User doesn't exist, create new record with generated UUID
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert([{ 
            id: userId, 
            name, 
            email, 
            voucher_balance: 0 
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating new user:', insertError);
          throw insertError;
        }
        userData = insertData;
      } catch (error) {
        console.error('Exception creating new user:', error);
        throw error;
      }
    }

    console.log(`User ${name} created as participant/subscriber (no login access)`);

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      voucherBalance: userData.voucher_balance
    };
  },

  // Update user information
  async update(userId: string, name: string, email: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      voucherBalance: data.voucher_balance
    };
  },

  // Update user voucher balance
  async updateVoucherBalance(userId: string, newBalance: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ voucher_balance: newBalance })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user voucher balance:', error);
      throw error;
    }
  }
};

// Training operations
export const trainingService = {
  // Get all trainings
  async getAll(): Promise<Training[]> {
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trainings:', error);
      throw error;
    }

    return data?.map(training => ({
      id: training.id,
      name: training.name,
      description: training.description
    })) || [];
  },

  // Create a new training
  async create(name: string, description: string): Promise<Training> {
    const { data, error } = await supabase
      .from('trainings')
      .insert([{ id: crypto.randomUUID(), name, description }])
      .select()
      .single();

    if (error) {
      console.error('Error creating training:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description
    };
  },

  // Update a training
  async update(trainingId: string, name: string, description: string): Promise<void> {
    const { error } = await supabase
      .from('trainings')
      .update({ name, description })
      .eq('id', trainingId);

    if (error) {
      console.error('Error updating training:', error);
      throw error;
    }
  },

  // Delete a training
  async delete(trainingId: string): Promise<void> {
    const { error } = await supabase
      .from('trainings')
      .delete()
      .eq('id', trainingId);

    if (error) {
      console.error('Error deleting training:', error);
      throw error;
    }
  }
};

// Subscription operations
export const subscriptionService = {
  // Get all subscriptions
  async getAll(): Promise<Map<string, Set<string>>> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('training_id, user_id');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    const subscriptions = new Map<string, Set<string>>();
    data?.forEach(sub => {
      if (!subscriptions.has(sub.training_id)) {
        subscriptions.set(sub.training_id, new Set());
      }
      subscriptions.get(sub.training_id)!.add(sub.user_id);
    });

    return subscriptions;
  },

  // Subscribe a user to a training
  async subscribe(trainingId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .insert([{ id: crypto.randomUUID(), training_id: trainingId, user_id: userId }])
      .select();

    if (error) {
      // Ignore duplicate key errors (user is already subscribed)
      if (error.code === '23505') {
        console.warn('User is already subscribed, ignoring error.');
        return;
      }
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Unsubscribe a user from a training
  async unsubscribe(trainingId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('training_id', trainingId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }
};

// Attendance operations
export const attendanceService = {
  // Get all attendance records
  async getAll(): Promise<Map<string, Set<string>>> {
    const { data, error } = await supabase
      .from('attendance')
      .select('training_id, user_id');

    if (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }

    const attendance = new Map<string, Set<string>>();
    data?.forEach(record => {
      if (!attendance.has(record.training_id)) {
        attendance.set(record.training_id, new Set());
      }
      attendance.get(record.training_id)!.add(record.user_id);
    });

    return attendance;
  },

  // Mark attendance for a user
  async markAttendance(trainingId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('attendance')
      .insert([{ id: crypto.randomUUID(), training_id: trainingId, user_id: userId }])
      .select();

    if (error) {
      // Ignore duplicate key errors (attendance is already marked)
      if (error.code === '23505') {
        console.warn('Attendance is already marked, ignoring error.');
        return;
      }
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  // Unmark attendance for a user
  async unmarkAttendance(trainingId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('training_id', trainingId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unmarking attendance:', error);
      throw error;
    }
  }
};

