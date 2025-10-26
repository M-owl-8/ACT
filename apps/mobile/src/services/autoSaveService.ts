/**
 * Auto-Save Service
 * Automatically saves data to both local storage and backend
 * with debouncing, retry logic, and silent error handling
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getDatabase } from './database';

interface AutoSaveOptions {
  debounceMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  showErrors?: boolean;
  tableName?: string;
}

interface SaveResult {
  success: boolean;
  error?: string;
  isSynced: boolean;
}

/**
 * Custom hook for auto-saving data
 * Saves to local DB immediately, syncs to backend with debounce
 */
export function useAutoSave<T extends Record<string, any>>(
  apiCall: (data: T) => Promise<any>,
  options: AutoSaveOptions = {}
) {
  const {
    debounceMs = 1000,
    retryCount = 3,
    retryDelayMs = 500,
    showErrors = false,
    tableName = 'auto_saves'
  } = options;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);

  // Retry with exponential backoff
  const retryableApiCall = useCallback(
    async (data: T, attemptNumber = 0): Promise<boolean> => {
      try {
        await apiCall(data);
        setHasError(false);
        return true;
      } catch (error) {
        if (attemptNumber < retryCount - 1) {
          const delay = retryDelayMs * Math.pow(2, attemptNumber);
          await new Promise(resolve => setTimeout(resolve, delay));
          return retryableApiCall(data, attemptNumber + 1);
        }

        if (showErrors) {
          console.error(`Auto-save failed after ${retryCount} attempts:`, error);
        }
        setHasError(true);
        return false;
      }
    },
    [apiCall, retryCount, retryDelayMs, showErrors]
  );

  // Save data to local DB
  const saveToLocalDB = useCallback(
    async (key: string, data: T) => {
      try {
        const db = getDatabase();
        const timestamp = new Date().toISOString();
        
        // Initialize table if needed
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0
          );
        `);

        await db.runAsync(
          `INSERT OR REPLACE INTO ${tableName} (key, data, saved_at, synced) 
           VALUES (?, ?, ?, 0)`,
          [key, JSON.stringify(data), timestamp]
        );

        return true;
      } catch (error) {
        console.warn('Failed to save to local DB:', error);
        return false;
      }
    },
    [tableName]
  );

  // Main save function with debounce
  const save = useCallback(
    async (key: string, data: T): Promise<SaveResult> => {
      pendingDataRef.current = data;

      // Save to local DB immediately (synchronous UI update)
      await saveToLocalDB(key, data);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer for backend sync
      return new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          try {
            setIsSaving(true);
            const syncedToBackend = await retryableApiCall(data);
            setLastSaveTime(Date.now());

            resolve({
              success: true,
              isSynced: syncedToBackend
            });
          } catch (error) {
            resolve({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              isSynced: false
            });
          } finally {
            setIsSaving(false);
          }
        }, debounceMs);
      });
    },
    [debounceMs, saveToLocalDB, retryableApiCall]
  );

  // Manual sync
  const syncNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (pendingDataRef.current) {
      return retryableApiCall(pendingDataRef.current);
    }
    return false;
  }, [retryableApiCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    save,
    syncNow,
    isSaving,
    hasError,
    lastSaveTime
  };
}

/**
 * Simple data persistence for preferences/settings
 * Auto-saves to secure storage
 */
export async function saveToSecureStorage(key: string, value: any): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to secure storage:`, error);
  }
}

export async function loadFromSecureStorage<T = any>(key: string, defaultValue?: T): Promise<T | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : defaultValue || null;
  } catch (error) {
    console.warn(`Failed to load ${key} from secure storage:`, error);
    return defaultValue || null;
  }
}

/**
 * Batch save multiple items with automatic sync
 */
export async function batchSave(items: Record<string, any>): Promise<void> {
  const promises = Object.entries(items).map(([key, value]) =>
    saveToSecureStorage(key, value)
  );
  await Promise.all(promises);
}

/**
 * Get unsaved changes from local DB
 */
export async function getUnsavedChanges(tableName = 'auto_saves'): Promise<Record<string, any>> {
  try {
    const db = getDatabase();
    const results = await db.getAllAsync(
      `SELECT key, data FROM ${tableName} WHERE synced = 0`
    );

    const unsavedData: Record<string, any> = {};
    results.forEach((row: any) => {
      unsavedData[row.key] = JSON.parse(row.data);
    });

    return unsavedData;
  } catch (error) {
    console.warn('Failed to get unsaved changes:', error);
    return {};
  }
}

/**
 * Mark changes as synced
 */
export async function markAsSynced(key: string, tableName = 'auto_saves'): Promise<void> {
  try {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE ${tableName} SET synced = 1 WHERE key = ?`,
      [key]
    );
  } catch (error) {
    console.warn('Failed to mark as synced:', error);
  }
}