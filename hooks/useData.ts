import { useState, useEffect, useCallback } from 'react';
import type { User, Training } from '../types';
import { userService, trainingService, subscriptionService, attendanceService } from '../services/dataService';

export const useData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [subscriptions, setSubscriptions] = useState<Map<string, Set<string>>>(new Map());
  const [attendance, setAttendance] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data on component mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, trainingsData, subscriptionsData, attendanceData] = await Promise.all([
        userService.getAll(),
        trainingService.getAll(),
        subscriptionService.getAll(),
        attendanceService.getAll()
      ]);

      setUsers(usersData);
      setTrainings(trainingsData);
      setSubscriptions(subscriptionsData);
      setAttendance(attendanceData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // User operations
  const createUser = useCallback(async (name: string, email: string) => {
    try {
      const newUser = await userService.create(name, email);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, name: string, email: string) => {
    try {
      const updatedUser = await userService.update(userId, name, email);
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }, []);

  const updateUserVoucherBalance = useCallback(async (userId: string, newBalance: number) => {
    try {
      await userService.updateVoucherBalance(userId, newBalance);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, voucherBalance: newBalance } : user
      ));
    } catch (err) {
      console.error('Error updating user voucher balance:', err);
      throw err;
    }
  }, []);

  // Training operations
  const createTraining = useCallback(async (name: string, description: string, trainingDate?: string, trainingTime?: string) => {
    try {
      const newTraining = await trainingService.create(name, description, trainingDate, trainingTime);
      setTrainings(prev => [...prev, newTraining]);
      setSubscriptions(prev => {
        const newSubs = new Map(prev);
        newSubs.set(newTraining.id, new Set());
        return newSubs;
      });
      return newTraining;
    } catch (err) {
      console.error('Error creating training:', err);
      throw err;
    }
  }, []);

  const updateTraining = useCallback(async (trainingId: string, name: string, description: string, trainingDate?: string, trainingTime?: string) => {
    try {
      await trainingService.update(trainingId, name, description, trainingDate, trainingTime);
      setTrainings(prev => prev.map(training => 
        training.id === trainingId ? { ...training, name, description, training_date: trainingDate, training_time: trainingTime } : training
      ));
    } catch (err) {
      console.error('Error updating training:', err);
      throw err;
    }
  }, []);

  const deleteTraining = useCallback(async (trainingId: string) => {
    try {
      await trainingService.delete(trainingId);
      setTrainings(prev => prev.filter(training => training.id !== trainingId));
      setSubscriptions(prev => {
        const newSubs = new Map(prev);
        newSubs.delete(trainingId);
        return newSubs;
      });
    } catch (err) {
      console.error('Error deleting training:', err);
      throw err;
    }
  }, []);

  // Subscription operations
  const subscribe = useCallback(async (trainingId: string, userId: string) => {
    try {
      await subscriptionService.subscribe(trainingId, userId);
      setSubscriptions(prev => {
        const newSubs = new Map(prev);
        const userIds = newSubs.get(trainingId) || new Set();
        const newUserIds = new Set(userIds); // Create a new Set for immutability
        newUserIds.add(userId);
        newSubs.set(trainingId, newUserIds);
        return newSubs;
      });
      // Update the training subscriber count
      setTrainings(prev => prev.map(training =>
        training.id === trainingId
          ? { ...training, subscriberCount: (training.subscriberCount || 0) + 1 }
          : training
      ));
    } catch (err) {
      console.error('Error subscribing:', err);
      throw err;
    }
  }, []);

  const unsubscribe = useCallback(async (trainingId: string, userId: string) => {
    try {
      await subscriptionService.unsubscribe(trainingId, userId);
      setSubscriptions(prev => {
        const newSubs = new Map(prev);
        const userIds = newSubs.get(trainingId);
        if (userIds) {
          const newUserIds = new Set(userIds); // Create a new Set for immutability
          newUserIds.delete(userId);
          newSubs.set(trainingId, newUserIds);
        }
        return newSubs;
      });
      // Update the training subscriber count
      setTrainings(prev => prev.map(training =>
        training.id === trainingId
          ? { ...training, subscriberCount: Math.max(0, (training.subscriberCount || 0) - 1) }
          : training
      ));
    } catch (err) {
      console.error('Error unsubscribing:', err);
      throw err;
    }
  }, []);

  // Attendance operations
  const markAttendance = useCallback(async (trainingId: string, userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user && user.voucherBalance > 0) {
        // Deduct voucher
        await updateUserVoucherBalance(userId, user.voucherBalance - 1);
        // Mark attendance
        await attendanceService.markAttendance(trainingId, userId);
        setAttendance(prev => {
          const newAttendance = new Map(prev);
          const attendees = newAttendance.get(trainingId) || new Set();
          const newAttendees = new Set(attendees); // Create a new Set for immutability
          newAttendees.add(userId);
          newAttendance.set(trainingId, newAttendees);
          return newAttendance;
        });
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      throw err;
    }
  }, [users, updateUserVoucherBalance]);

  const unmarkAttendance = useCallback(async (trainingId: string, userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        // Refund voucher
        await updateUserVoucherBalance(userId, user.voucherBalance + 1);
        // Unmark attendance
        await attendanceService.unmarkAttendance(trainingId, userId);
        setAttendance(prev => {
          const newAttendance = new Map(prev);
          const attendees = newAttendance.get(trainingId);
          if (attendees) {
            const newAttendees = new Set(attendees); // Create a new Set for immutability
            newAttendees.delete(userId);
            newAttendance.set(trainingId, newAttendees);
          }
          return newAttendance;
        });
      }
    } catch (err) {
      console.error('Error unmarking attendance:', err);
      throw err;
    }
  }, [users, updateUserVoucherBalance]);

  return {
    // Data
    users,
    trainings,
    subscriptions,
    attendance,
    loading,
    error,
    
    // Operations
    loadData,
    createUser,
    updateUser,
    updateUserVoucherBalance,
    createTraining,
    updateTraining,
    deleteTraining,
    subscribe,
    unsubscribe,
    markAttendance,
    unmarkAttendance
  };
};

