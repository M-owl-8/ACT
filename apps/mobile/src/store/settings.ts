/**
 * Settings Store
 * Manages all user preferences with automatic saving
 */

import { create } from 'zustand';
import { saveToSecureStorage, loadFromSecureStorage } from '../services/autoSaveService';
import { API } from '../api/client';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Notification settings
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  
  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  language: string;
  
  // Privacy settings
  dataSharingEnabled: boolean;
  usageStatsEnabled: boolean;
  
  // Account info (cached from backend)
  fullName: string;
  email: string;
  
  // Actions
  setEmailNotifications: (enabled: boolean) => Promise<void>;
  setPushNotifications: (enabled: boolean) => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>;
  setFontSize: (size: number) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setDataSharing: (enabled: boolean) => Promise<void>;
  setUsageStats: (enabled: boolean) => Promise<void>;
  setFullName: (name: string) => Promise<void>;
  setEmail: (email: string) => Promise<void>;
  
  // Load settings from storage
  loadSettings: () => Promise<void>;
  
  // Sync to backend
  syncToBackend: () => Promise<void>;
}

const SETTINGS_STORAGE_KEY = 'app_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: false,
  theme: 'light',
  fontSize: 14,
  language: 'en',
  dataSharingEnabled: true,
  usageStatsEnabled: true,
  fullName: '',
  email: '',

  setEmailNotifications: async (enabled) => {
    set({ emailNotificationsEnabled: enabled });
    await get().syncToBackend();
  },

  setPushNotifications: async (enabled) => {
    set({ pushNotificationsEnabled: enabled });
    await get().syncToBackend();
  },

  setTheme: async (theme) => {
    set({ theme });
    await get().syncToBackend();
  },

  setFontSize: async (size) => {
    const clampedSize = Math.max(10, Math.min(24, size));
    set({ fontSize: clampedSize });
    await get().syncToBackend();
  },

  setLanguage: async (language) => {
    try {
      console.log(`🌐🌐🌐 STARTING LANGUAGE CHANGE TO: ${language}`);
      console.log(`  Before: i18n.language = ${i18n.language}`);
      
      // Verify language is valid
      if (!['en', 'ru', 'uz', 'es'].includes(language)) {
        throw new Error(`Invalid language code: ${language}`);
      }
      
      // Change i18n language FIRST before updating state
      // This ensures components re-render with the correct language
      const result = await i18n.changeLanguage(language);
      console.log(`✅ i18n.changeLanguage() completed, result:`, result);
      console.log(`✅ After changeLanguage: i18n.language = ${i18n.language}`);
      
      // Force another check to ensure it actually changed
      if (i18n.language !== language) {
        console.warn(`⚠️ WARNING: i18n.language is still ${i18n.language}, trying again...`);
        await i18n.changeLanguage(language);
        console.log(`✅ Retry: i18n.language = ${i18n.language}`);
      }
      
      // Verify translations are available for the new language
      const testTranslation = i18n.t('settings');
      console.log(`✅ Test translation: t('settings') = "${testTranslation}"`);
      
      // Small delay to ensure i18n event is processed
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Update store AFTER i18n is ready
      set({ language });
      console.log(`✅ Zustand store updated with language ${language}`);
      
      // Cache language for next app launch
      await AsyncStorage.setItem('user-language', language);
      console.log(`✅ Language saved to AsyncStorage: ${language}`);
      
      // Verify it was saved
      const saved = await AsyncStorage.getItem('user-language');
      console.log(`✅ Language verified in storage: ${saved}`);
      
      console.log(`🌐🌐🌐 LANGUAGE CHANGE COMPLETE: ${i18n.language}`);
      
      // Sync to backend (non-critical, fire and forget)
      get().syncToBackend().catch(err => {
        console.warn('⚠️ Backend sync failed for language, but local storage is saved');
      });
      
    } catch (error) {
      console.error(`❌ Error changing language to ${language}:`, error);
      throw error;
    }
  },

  setDataSharing: async (enabled) => {
    set({ dataSharingEnabled: enabled });
    await get().syncToBackend();
  },

  setUsageStats: async (enabled) => {
    set({ usageStatsEnabled: enabled });
    await get().syncToBackend();
  },

  setFullName: async (name) => {
    set({ fullName: name });
    await get().syncToBackend();
  },

  setEmail: async (email) => {
    set({ email });
    await get().syncToBackend();
  },

  loadSettings: async () => {
    try {
      const saved = await loadFromSecureStorage(SETTINGS_STORAGE_KEY);
      
      if (!saved) {
        console.log('ℹ️ No saved settings found in storage, using defaults');
        return;
      }

      // Validate and sanitize loaded settings
      const cleanSettings = {
        emailNotificationsEnabled: typeof saved.emailNotificationsEnabled === 'boolean' ? saved.emailNotificationsEnabled : true,
        pushNotificationsEnabled: typeof saved.pushNotificationsEnabled === 'boolean' ? saved.pushNotificationsEnabled : false,
        theme: ['light', 'dark', 'auto'].includes(saved.theme) ? saved.theme : 'light',
        fontSize: typeof saved.fontSize === 'number' ? Math.max(10, Math.min(24, saved.fontSize)) : 14,
        language: saved.language && typeof saved.language === 'string' ? saved.language : 'en',
        dataSharingEnabled: typeof saved.dataSharingEnabled === 'boolean' ? saved.dataSharingEnabled : true,
        usageStatsEnabled: typeof saved.usageStatsEnabled === 'boolean' ? saved.usageStatsEnabled : true,
        fullName: typeof saved.fullName === 'string' ? saved.fullName : '',
        email: typeof saved.email === 'string' ? saved.email : '',
      };
      
      // Update store with sanitized data
      set(cleanSettings);
      
      // Apply language to i18n if different from current
      if (cleanSettings.language && i18n.language !== cleanSettings.language) {
        try {
          console.log(`🌐 Applying saved language to i18n: ${cleanSettings.language}`);
          await i18n.changeLanguage(cleanSettings.language);
          console.log(`✅ i18n language changed to: ${i18n.language}`);
        } catch (langError) {
          console.warn(`⚠️ Failed to change language to ${cleanSettings.language}:`, langError);
        }
      }
      
      console.log('✅ Settings loaded and validated from storage');
    } catch (error) {
      console.warn('❌ Failed to load settings:', error);
      // Continue with defaults - do not crash
    }
  },

  syncToBackend: async () => {
    try {
      const state = get();
      const settingsData = {
        email_notifications: state.emailNotificationsEnabled,
        push_notifications: state.pushNotificationsEnabled,
        theme: state.theme,
        font_size: state.fontSize,
        language: state.language,
        data_sharing: state.dataSharingEnabled,
        usage_stats: state.usageStatsEnabled,
        auto_backup: true,
      };

      // Save to local storage immediately with proper error handling
      try {
        await saveToSecureStorage(SETTINGS_STORAGE_KEY, {
          emailNotificationsEnabled: state.emailNotificationsEnabled,
          pushNotificationsEnabled: state.pushNotificationsEnabled,
          theme: state.theme,
          fontSize: state.fontSize,
          language: state.language,
          dataSharingEnabled: state.dataSharingEnabled,
          usageStatsEnabled: state.usageStatsEnabled,
          fullName: state.fullName,
          email: state.email,
        });
        console.log('✅ Settings saved to secure storage');
      } catch (storageError) {
        console.warn('⚠️ Failed to save settings locally:', storageError);
      }

      // Sync to backend (fire and forget with error handling)
      try {
        await API.post('/users/settings', settingsData);
        console.log('✅ Settings synced to backend');
      } catch (error) {
        console.warn('⚠️ Failed to sync settings to backend (saved locally):', error);
        // Settings are already saved locally, so this is not critical
      }
    } catch (error) {
      console.error('❌ Error syncing settings:', error);
    }
  },
}));