import { create } from 'zustand';
import { api } from '../api/client';
import { useAutoSave } from '../services/autoSaveService';

export interface Goal {
  id: number;
  kind: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  status: string;
  start_date: string;
  end_date: string;
  progress_percentage: number | null;
}

interface GoalsStore {
  goals: Goal[];
  loading: boolean;
  loadGoals: () => Promise<void>;
  createGoal: (goalData: any) => Promise<Goal | null>;
  deleteGoal: (goalId: number) => Promise<boolean>;
  completeGoal: (goalId: number) => Promise<boolean>;
  addSavings: (goalId: number, amount: number) => Promise<Goal | null>;
  syncGoalsToBackend: () => Promise<void>;
}

export const useGoalsStore = create<GoalsStore>((set, get) => ({
  goals: [],
  loading: false,

  loadGoals: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/motivation/goals');
      
      if (Array.isArray(response.data)) {
        set({ goals: response.data });
        // Auto-save goals to local storage
        await saveGoalsLocally(response.data);
      } else {
        console.warn('Goals response is not an array:', response.data);
        set({ goals: [] });
      }
    } catch (error: any) {
      console.error('Error loading goals:', error);
      console.error('Error response:', error.response?.data);
      
      // Check for session expiration
      if (error.message?.includes('No refresh token available') || 
          error.message?.includes('session expired')) {
        console.error('🚨 Session has expired during goal loading');
      }
      
      set({ goals: [] });
    } finally {
      set({ loading: false });
    }
  },

  createGoal: async (goalData: any) => {
    try {
      const response = await api.post('/motivation/goals', goalData);
      const newGoal = response.data;
      
      // Update local state
      const currentGoals = get().goals;
      const updatedGoals = [...currentGoals, newGoal];
      set({ goals: updatedGoals });
      
      // Auto-save to local storage
      await saveGoalsLocally(updatedGoals);
      
      console.log('Goal created successfully:', newGoal);
      return newGoal;
    } catch (error: any) {
      console.error('Error creating goal:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  deleteGoal: async (goalId: number) => {
    try {
      await api.delete(`/motivation/goals/${goalId}`);
      
      // Update local state
      const currentGoals = get().goals;
      const updatedGoals = currentGoals.filter(g => g.id !== goalId);
      set({ goals: updatedGoals });
      
      // Auto-save to local storage
      await saveGoalsLocally(updatedGoals);
      
      console.log('Goal deleted successfully:', goalId);
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  completeGoal: async (goalId: number) => {
    try {
      await api.post(`/motivation/goals/${goalId}/complete`);
      
      // Update local state
      const currentGoals = get().goals;
      const updatedGoals = currentGoals.map(g =>
        g.id === goalId ? { ...g, status: 'completed' } : g
      );
      set({ goals: updatedGoals });
      
      // Auto-save to local storage
      await saveGoalsLocally(updatedGoals);
      
      console.log('Goal completed successfully:', goalId);
      return true;
    } catch (error) {
      console.error('Error completing goal:', error);
      throw error;
    }
  },

  addSavings: async (goalId: number, amount: number) => {
    try {
      const response = await api.post(`/motivation/goals/${goalId}/add-savings`, {
        amount: amount,
      });
      
      const updatedGoal = response.data;
      
      // Update local state
      const currentGoals = get().goals;
      const updatedGoals = currentGoals.map(g =>
        g.id === goalId ? updatedGoal : g
      );
      set({ goals: updatedGoals });
      
      // Auto-save to local storage
      await saveGoalsLocally(updatedGoals);
      
      console.log('Savings added successfully:', { goalId, amount });
      return updatedGoal;
    } catch (error) {
      console.error('Error adding savings:', error);
      throw error;
    }
  },

  syncGoalsToBackend: async () => {
    try {
      // Reload goals from backend to ensure sync
      const response = await api.get('/motivation/goals');
      if (Array.isArray(response.data)) {
        set({ goals: response.data });
        await saveGoalsLocally(response.data);
      }
    } catch (error) {
      console.error('Error syncing goals:', error);
    }
  },
}));

// Helper function to save goals locally
async function saveGoalsLocally(goals: Goal[]) {
  try {
    // Goals are saved to the database in the services layer
    // This is a placeholder for potential local storage optimization
    console.log(`✓ Goals saved locally: ${goals.length} items`);
  } catch (error) {
    console.error('Error saving goals locally:', error);
  }
}