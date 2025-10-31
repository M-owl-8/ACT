import { create } from 'zustand';

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

// Default guest user for offline mode
const DEFAULT_GUEST_USER: User = {
  id: 1,
  email: 'guest@local',
  is_admin: false,
  name: 'Guest User',
  language: 'en',
  theme: 'dark',
  currency: 'USD',
  created_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: 'local-offline-mode',
  refreshToken: 'local-offline-mode',
  user: null,
  isLoading: true,

  setTokens: async (access, refresh) => {
    // No-op in offline mode
    set({ accessToken: access, refreshToken: refresh });
    console.log('✅ Tokens set (offline mode)');
  },

  logout: async () => {
    // No-op in offline mode - user stays logged in as guest
    console.log('⚠️ Logout not available in offline mode');
  },

  fetchProfile: async () => {
    // Return default guest user
    set({ user: DEFAULT_GUEST_USER });
    console.log('✅ Guest profile loaded');
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      console.log('🔐 Initializing authentication (offline mode)...');
      
      // Auto-login as guest user
      await get().fetchProfile();
      
      console.log('✅ Auth initialization complete - logged in as guest');
    } catch (error) {
      console.error('❌ Failed to initialize auth:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
