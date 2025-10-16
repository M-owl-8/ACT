/**
 * Standalone Authentication Store
 * Works completely offline - no backend required!
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getDatabase, User } from '../services/database';

// Simple password hashing (React Native compatible)
// Note: This is a simple hash for demo purposes
// In production, you'd want to use a proper library like expo-crypto
async function hashPassword(password: string): Promise<string> {
  // Simple hash using string manipulation (React Native compatible)
  // This is NOT cryptographically secure - use expo-crypto in production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Add some salt and convert to hex string
  const salted = Math.abs(hash).toString(16) + password.length.toString(16);
  return salted.padStart(16, '0');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  
  // Actions
  register: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  
  /**
   * Register a new user
   */
  register: async (email: string, password: string, name?: string) => {
    try {
      console.log('🔐 Registering user:', email);
      
      const db = getDatabase();
      
      // Check if user already exists
      const existing = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (existing) {
        throw new Error('User with this email already exists');
      }
      
      // Hash password
      const passwordHash = await hashPassword(password);
      
      // Create user
      const result = await db.runAsync(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, passwordHash, name || null]
      );
      
      // Get the created user
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
        [result.lastInsertRowId]
      );
      
      if (!user) {
        throw new Error('Failed to create user');
      }
      
      // Save user ID to secure storage
      await SecureStore.setItemAsync('userId', user.id.toString());
      
      // Copy default categories to this user
      await db.execAsync(`
        INSERT INTO categories (user_id, name, type, icon, color, is_default)
        SELECT ${user.id}, name, type, icon, color, 0
        FROM categories
        WHERE user_id = 0
      `);
      
      set({ user, isLoading: false });
      
      console.log('✅ User registered successfully:', user.email);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },
  
  /**
   * Login existing user
   */
  login: async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in user:', email);
      
      const db = getDatabase();
      
      // Find user
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const isValid = await verifyPassword(password, user.password_hash);
      
      if (!isValid) {
        throw new Error('Invalid email or password');
      }
      
      // Save user ID to secure storage
      await SecureStore.setItemAsync('userId', user.id.toString());
      
      set({ user, isLoading: false });
      
      console.log('✅ User logged in successfully:', user.email);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },
  
  /**
   * Logout current user
   */
  logout: async () => {
    try {
      console.log('🔐 Logging out user');
      
      // Remove user ID from secure storage
      await SecureStore.deleteItemAsync('userId');
      
      set({ user: null, isLoading: false });
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  },
  
  /**
   * Initialize auth on app start (restore session)
   */
  initializeAuth: async () => {
    try {
      console.log('🔐 Initializing auth...');
      
      set({ isLoading: true });
      
      // Check if user ID exists in secure storage
      const userIdStr = await SecureStore.getItemAsync('userId');
      
      if (!userIdStr) {
        console.log('ℹ️ No saved user session');
        set({ user: null, isLoading: false });
        return;
      }
      
      const userId = parseInt(userIdStr, 10);
      const db = getDatabase();
      
      // Get user from database
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      if (!user) {
        console.log('⚠️ Saved user not found in database');
        await SecureStore.deleteItemAsync('userId');
        set({ user: null, isLoading: false });
        return;
      }
      
      set({ user, isLoading: false });
      
      console.log('✅ User session restored:', user.email);
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      set({ user: null, isLoading: false });
    }
  },
}));