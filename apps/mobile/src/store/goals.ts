import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const GOALS_STORAGE_KEY = 'GOALS_DATA';

async function loadGoalsFromStorage(): Promise<Goal[]> {
  try {
    const data = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading goals from storage:', error);
    return [];
  }
}

async function saveGoalsToStorage(goals: Goal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goals to storage:', error);
  }
}

export const useGoalsStore = create<GoalsStore>((set, get) => ({
  goals: [],
  loading: false,

  loadGoals: async () => {
    try {
      set({ loading: true });
      const goals = await loadGoalsFromStorage();
      set({ goals });
      console.log('Goals loaded from local storage:', goals);
    } catch (error: any) {
      console.error('Error loading goals:', error);
      set({ goals: [] });
    } finally {
      set({ loading: false });
    }
  },

  createGoal: async (goalData: any) => {
    try {
      const currentGoals = get().goals;
      
      // Generate a new ID (use timestamp + random number)
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      const newGoal: Goal = {
        id: newId,
        kind: goalData.kind,
        title: goalData.title,
        description: goalData.description || null,
        target_value: goalData.target_value,
        current_value: 0,
        status: goalData.status || 'active',
        start_date: goalData.start_date,
        end_date: goalData.end_date,
        progress_percentage: 0,
      };
      
      const updatedGoals = [...currentGoals, newGoal];
      set({ goals: updatedGoals });
      
      // Save to storage
      await saveGoalsToStorage(updatedGoals);
      
      console.log('Goal created successfully:', newGoal);
      return newGoal;
    } catch (error: any) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  deleteGoal: async (goalId: number) => {
    try {
      const currentGoals = get().goals;
      const updatedGoals = currentGoals.filter(g => g.id !== goalId);
      set({ goals: updatedGoals });
      
      // Save to storage
      await saveGoalsToStorage(updatedGoals);
      
      console.log('Goal deleted successfully:', goalId);
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  completeGoal: async (goalId: number) => {
    try {
      const currentGoals = get().goals;
      const updatedGoals = currentGoals.map(g =>
        g.id === goalId ? { ...g, status: 'completed' } : g
      );
      set({ goals: updatedGoals });
      
      // Save to storage
      await saveGoalsToStorage(updatedGoals);
      
      console.log('Goal completed successfully:', goalId);
      return true;
    } catch (error) {
      console.error('Error completing goal:', error);
      throw error;
    }
  },

  addSavings: async (goalId: number, amount: number) => {
    try {
      const currentGoals = get().goals;
      
      const updatedGoals = currentGoals.map(g => {
        if (g.id === goalId) {
          const newCurrent = g.current_value + amount;
          const progressPercentage = Math.min(
            Math.round((newCurrent / g.target_value) * 100),
            100
          );
          
          return {
            ...g,
            current_value: newCurrent,
            progress_percentage: progressPercentage,
            status: newCurrent >= g.target_value ? 'completed' : g.status,
          };
        }
        return g;
      });
      
      set({ goals: updatedGoals });
      
      // Save to storage
      await saveGoalsToStorage(updatedGoals);
      
      console.log('Savings added successfully:', { goalId, amount });
      
      const updatedGoal = updatedGoals.find(g => g.id === goalId) || null;
      return updatedGoal;
    } catch (error) {
      console.error('Error adding savings:', error);
      throw error;
    }
  },

  syncGoalsToBackend: async () => {
    // No-op for offline mode - goals are stored locally
    console.log('Goals sync (offline mode - using local storage)');
  },
}));