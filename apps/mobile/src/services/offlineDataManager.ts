/**
 * Offline Data Manager
 * Comprehensive offline-first data persistence with conflict resolution
 * Ensures all user data is saved locally and works authentically offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToSecureStorage, loadFromSecureStorage } from './autoSaveService';
import { getDatabase } from './database';

export interface DataSyncState {
  id: string;
  tableName: string;
  data: any;
  timestamp: number;
  synced: boolean;
  version: number;
  localVersion: number;
}

export interface ConflictResolutionStrategy {
  strategy: 'local' | 'remote' | 'merge' | 'newer';
  customResolver?: (local: any, remote: any) => any;
}

const SYNC_QUEUE_KEY = 'DATA_SYNC_QUEUE';
const DATA_VERSION_KEY = 'DATA_VERSIONS';
const CONFLICT_LOG_KEY = 'CONFLICT_LOG';

/**
 * Save data locally with version tracking
 */
export async function saveDataLocally(
  tableName: string,
  id: string,
  data: any,
  version: number = 1
): Promise<void> {
  try {
    const key = `${tableName}:${id}`;
    
    // Save to SQLite for structured data
    const db = getDatabase();
    const timestamp = new Date().toISOString();
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_data (
        key TEXT PRIMARY KEY,
        table_name TEXT,
        data TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        local_version INTEGER DEFAULT 1,
        timestamp DATETIME,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await db.runAsync(
      `INSERT OR REPLACE INTO offline_data 
       (key, table_name, data, version, local_version, timestamp, synced) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [key, tableName, JSON.stringify(data), version, version + 1, timestamp]
    );
    
    // Update version tracking
    const versions = await loadVersions();
    versions[key] = { version, timestamp, synced: false };
    await AsyncStorage.setItem(DATA_VERSION_KEY, JSON.stringify(versions));
    
    console.log(`✅ Data saved locally: ${key} (v${version})`);
  } catch (error) {
    console.error(`❌ Failed to save data locally (${tableName}:${id}):`, error);
    throw error;
  }
}

/**
 * Load data locally
 */
export async function loadDataLocally<T = any>(
  tableName: string,
  id: string,
  defaultValue?: T
): Promise<T | null> {
  try {
    const db = getDatabase();
    const key = `${tableName}:${id}`;
    
    const result = await db.getFirstAsync<{ data: string }>(
      'SELECT data FROM offline_data WHERE key = ?',
      [key]
    );
    
    if (!result) {
      return defaultValue || null;
    }
    
    return JSON.parse(result.data) as T;
  } catch (error) {
    console.error(`⚠️ Failed to load data locally (${tableName}:${id}):`, error);
    return defaultValue || null;
  }
}

/**
 * Load all data for a table
 */
export async function loadTableDataLocally<T = any>(tableName: string): Promise<T[]> {
  try {
    const db = getDatabase();
    
    const results = await db.getAllAsync<{ data: string }>(
      'SELECT data FROM offline_data WHERE table_name = ?',
      [tableName]
    );
    
    return results.map(row => JSON.parse(row.data)) as T[];
  } catch (error) {
    console.error(`⚠️ Failed to load table data locally (${tableName}):`, error);
    return [];
  }
}

/**
 * Queue data for sync to backend
 */
export async function queueForSync(
  tableName: string,
  id: string,
  data: any,
  operation: 'create' | 'update' | 'delete'
): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const key = `${tableName}:${id}`;
    
    const syncItem: DataSyncState = {
      id: key,
      tableName,
      data,
      timestamp: Date.now(),
      synced: false,
      version: 1,
      localVersion: 1
    };
    
    // Add or update in queue
    const existing = queue.findIndex(item => item.id === key);
    if (existing >= 0) {
      queue[existing] = syncItem;
    } else {
      queue.push(syncItem);
    }
    
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log(`✅ Queued for sync: ${key} (${operation})`);
  } catch (error) {
    console.error(`❌ Failed to queue for sync:`, error);
  }
}

/**
 * Get sync queue
 */
export async function getSyncQueue(): Promise<DataSyncState[]> {
  try {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('⚠️ Failed to get sync queue:', error);
    return [];
  }
}

/**
 * Mark items as synced
 */
export async function markAsSynced(keys: string[]): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const updated = queue.filter(item => !keys.includes(item.id));
    
    // Mark as synced in database
    const db = getDatabase();
    for (const key of keys) {
      await db.runAsync(
        'UPDATE offline_data SET synced = 1 WHERE key = ?',
        [key]
      );
    }
    
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
    console.log(`✅ Marked ${keys.length} items as synced`);
  } catch (error) {
    console.error('⚠️ Failed to mark as synced:', error);
  }
}

/**
 * Load versions for conflict resolution
 */
export async function loadVersions(): Promise<Record<string, any>> {
  try {
    const versions = await AsyncStorage.getItem(DATA_VERSION_KEY);
    return versions ? JSON.parse(versions) : {};
  } catch (error) {
    console.error('⚠️ Failed to load versions:', error);
    return {};
  }
}

/**
 * Resolve conflicts using specified strategy
 */
export async function resolveConflict(
  key: string,
  localData: any,
  remoteData: any,
  strategy: ConflictResolutionStrategy
): Promise<any> {
  try {
    let resolved = localData;
    
    switch (strategy.strategy) {
      case 'local':
        resolved = localData;
        break;
      case 'remote':
        resolved = remoteData;
        break;
      case 'newer':
        const localTime = localData?.timestamp || 0;
        const remoteTime = remoteData?.timestamp || 0;
        resolved = remoteTime > localTime ? remoteData : localData;
        break;
      case 'merge':
        if (strategy.customResolver) {
          resolved = strategy.customResolver(localData, remoteData);
        } else {
          // Default merge: combine objects
          resolved = { ...localData, ...remoteData };
        }
        break;
    }
    
    // Log conflict
    await logConflict(key, localData, remoteData, resolved);
    
    return resolved;
  } catch (error) {
    console.error('❌ Conflict resolution failed:', error);
    throw error;
  }
}

/**
 * Log conflicts for debugging
 */
async function logConflict(key: string, local: any, remote: any, resolved: any): Promise<void> {
  try {
    const log = await AsyncStorage.getItem(CONFLICT_LOG_KEY);
    const conflicts = log ? JSON.parse(log) : [];
    
    conflicts.push({
      key,
      timestamp: new Date().toISOString(),
      local,
      remote,
      resolved
    });
    
    // Keep only last 100 conflicts
    const trimmed = conflicts.slice(-100);
    
    await AsyncStorage.setItem(CONFLICT_LOG_KEY, JSON.stringify(trimmed));
    console.log(`📝 Conflict logged for: ${key}`);
  } catch (error) {
    console.error('⚠️ Failed to log conflict:', error);
  }
}

/**
 * Clear all offline data (use with caution)
 */
export async function clearOfflineData(): Promise<void> {
  try {
    const db = getDatabase();
    
    // Clear database tables
    await db.execAsync('DELETE FROM offline_data;');
    
    // Clear AsyncStorage
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    await AsyncStorage.removeItem(DATA_VERSION_KEY);
    
    console.log('⚠️ All offline data cleared');
  } catch (error) {
    console.error('❌ Failed to clear offline data:', error);
  }
}

/**
 * Get offline data statistics
 */
export async function getOfflineStats(): Promise<{
  totalItems: number;
  syncedItems: number;
  unsyncedItems: number;
  queueSize: number;
  conflictCount: number;
}> {
  try {
    const db = getDatabase();
    const queue = await getSyncQueue();
    const conflicts = await AsyncStorage.getItem(CONFLICT_LOG_KEY);
    
    const totalResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM offline_data'
    );
    const syncedResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM offline_data WHERE synced = 1'
    );
    
    return {
      totalItems: totalResult?.count || 0,
      syncedItems: syncedResult?.count || 0,
      unsyncedItems: (totalResult?.count || 0) - (syncedResult?.count || 0),
      queueSize: queue.length,
      conflictCount: conflicts ? JSON.parse(conflicts).length : 0
    };
  } catch (error) {
    console.error('⚠️ Failed to get offline stats:', error);
    return {
      totalItems: 0,
      syncedItems: 0,
      unsyncedItems: 0,
      queueSize: 0,
      conflictCount: 0
    };
  }
}

/**
 * Health check - verify data integrity
 */
export async function performHealthCheck(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    const db = getDatabase();
    
    // Check database integrity
    const dbCheck = await db.getFirstAsync<{ integrity_ok: number }>(
      'PRAGMA integrity_check'
    );
    
    if (!dbCheck || dbCheck.integrity_ok !== 1) {
      issues.push('Database integrity check failed');
    }
    
    // Check for orphaned data
    const orphaned = await db.getAllAsync(
      'SELECT COUNT(*) as count FROM offline_data WHERE data IS NULL'
    );
    
    if (orphaned && orphaned.length > 0) {
      issues.push(`Found ${orphaned[0]} orphaned data entries`);
    }
    
    // Check sync queue integrity
    const queue = await getSyncQueue();
    for (const item of queue) {
      if (!item.id || !item.tableName) {
        issues.push(`Invalid sync queue item: ${JSON.stringify(item)}`);
      }
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      healthy: false,
      issues: [String(error)]
    };
  }
}