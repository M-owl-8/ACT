import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { API } from '../api/client';

type User = {
  id: number;
  email: string;
  is_admin: boolean;
  name?: string;
  language: string;
  theme: string;
  currency: string;
  created_at: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initializeAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,

  setTokens: async (access, refresh) => {
    try {
      await SecureStore.setItemAsync('access', access);
      await SecureStore.setItemAsync('refresh', refresh);
      set({ accessToken: access, refreshToken: refresh });
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Get refresh token before clearing
      const refreshToken = await SecureStore.getItemAsync('refresh');
      
      // Call backend to revoke refresh token
      if (refreshToken) {
        try {
          await API.post('/auth/logout', { refresh_token: refreshToken });
        } catch (error) {
          // Ignore logout errors, still clear local tokens
          console.warn('Logout API call failed:', error);
        }
      }
    } finally {
      // Always clear local tokens
      try {
        await SecureStore.deleteItemAsync('access');
        await SecureStore.deleteItemAsync('refresh');
      } catch (error) {
        console.warn('Failed to delete tokens from secure store:', error);
      }
      set({ accessToken: null, refreshToken: null, user: null });
    }
  },

  fetchProfile: async () => {
    try {
      const { accessToken } = get();
      if (!accessToken) {
        console.log('No access token available for profile fetch');
        return;
      }
      
      const res = await API.get('/users/me');
      set({ user: res.data });
      console.log('Profile fetched successfully:', res.data.email);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error.response?.data || error.message);
      // If profile fetch fails with 401, clear auth state
      if (error.response?.status === 401) {
        await get().logout();
      }
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      // Try to restore tokens from secure storage
      const accessToken = await SecureStore.getItemAsync('access');
      const refreshToken = await SecureStore.getItemAsync('refresh');

      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken });
        await get().fetchProfile();
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
