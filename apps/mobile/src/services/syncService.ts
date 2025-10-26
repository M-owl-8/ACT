/**
 * Global Sync Service
 * Handles syncing unsaved changes when connection is restored
 */

import NetInfo from '@react-native-community/netinfo';

interface SyncListener {
  onOnline: () => Promise<void>;
  onOffline: () => void;
}

interface NamedSyncListener {
  name: string;
  onSync: () => Promise<void>;
}

let isOnline = true;
let listeners: SyncListener[] = [];
let namedListeners: NamedSyncListener[] = [];
let netInfoUnsubscribe: (() => void) | null = null;

/**
 * Initialize network monitoring
 */
export async function initializeSyncService(): Promise<void> {
  try {
    console.log('🌐 Initializing sync service...');

    // Check initial connectivity
    const state = await NetInfo.fetch();
    isOnline = state.isConnected ?? true;
    console.log(`📡 Initial network state: ${isOnline ? 'online' : 'offline'}`);

    // Listen to network changes
    netInfoUnsubscribe = NetInfo.addEventListener(async (state) => {
      const wasOnline = isOnline;
      isOnline = state.isConnected ?? true;

      if (!wasOnline && isOnline) {
        console.log('✅ Network restored - syncing changes...');
        await syncAllChanges();
      } else if (wasOnline && !isOnline) {
        console.log('❌ Network lost - changes saved locally');
      }
    });

    console.log('✅ Sync service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize sync service:', error);
  }
}

/**
 * Sync all unsaved changes from local DB to backend
 */
export async function syncAllChanges(): Promise<void> {
  try {
    const unsavedChanges = await getUnsavedChanges();

    if (Object.keys(unsavedChanges).length === 0) {
      console.log('ℹ️ No unsaved changes to sync');
      return;
    }

    console.log(
      `🔄 Syncing ${Object.keys(unsavedChanges).length} unsaved changes...`
    );

    // Notify all listeners to sync their data
    for (const listener of listeners) {
      try {
        await listener.onOnline();
      } catch (error) {
        console.error('Failed to sync listener data:', error);
      }
    }

    // Notify all named listeners
    for (const listener of namedListeners) {
      try {
        console.log(`🔄 Syncing ${listener.name}...`);
        await listener.onSync();
      } catch (error) {
        console.error(`Failed to sync ${listener.name}:`, error);
      }
    }

    console.log('✅ Sync completed');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

/**
 * Register a sync listener (e.g., from a screen or store)
 * Can accept either a SyncListener object or a name + callback
 */
export function addSyncListener(
  nameOrListener: string | SyncListener,
  onSync?: () => Promise<void>
): (() => void) | void {
  // Named listener pattern (new API)
  if (typeof nameOrListener === 'string' && onSync) {
    const listener: NamedSyncListener = {
      name: nameOrListener,
      onSync,
    };
    namedListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      namedListeners = namedListeners.filter((l) => l !== listener);
    };
  }
  
  // Traditional listener pattern (backward compatibility)
  if (typeof nameOrListener === 'object' && !onSync) {
    listeners.push(nameOrListener);
  }
}

/**
 * Remove a sync listener (call on screen unmount)
 */
export function removeSyncListener(listener: SyncListener): void {
  listeners = listeners.filter((l) => l !== listener);
}

/**
 * Check if app is currently online
 */
export function isNetworkOnline(): boolean {
  return isOnline;
}

/**
 * Manual sync trigger (useful for pull-to-refresh)
 */
export async function manualSync(): Promise<void> {
  if (!isOnline) {
    console.warn('⚠️ Cannot sync while offline');
    return;
  }
  await syncAllChanges();
}

/**
 * Cleanup (call on app close)
 */
export function cleanupSyncService(): void {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
  listeners = [];
  namedListeners = [];
  console.log('✅ Sync service cleaned up');
}