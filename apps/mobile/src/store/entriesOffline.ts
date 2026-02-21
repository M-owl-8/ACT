/**
 * Offline-First Entries Store
 * All user income/expense entries saved locally and synced to backend
 */

import { create } from 'zustand';
import { 
  saveDataLocally, 
  loadDataLocally,
  loadTableDataLocally,
  queueForSync, 
  markAsSynced 
} from '../services/offlineDataManager';
import { API } from '../api/client';
import { getDatabase, Entry } from '../services/database';

interface EntriesStore {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  
  loadEntries: () => Promise<void>;
  createEntry: (entry: Omit<Entry, 'id' | 'created_at' | 'updated_at'>) => Promise<Entry>;
  updateEntry: (id: number, updates: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  syncToBackend: () => Promise<void>;
  getStats: (filters?: any) => Promise<{ income: number; expenses: number }>;
}

export const useEntriesStoreOffline = create<EntriesStore>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  /**
   * Load entries from local database
   */
  loadEntries: async () => {
    try {
      set({ loading: true, error: null });
      console.log('📊 Loading entries from local storage...');
      
      const db = getDatabase();
      
      // Create table if needed
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          description TEXT,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0
        );
      `);
      
      // Load all entries
      const entries = await db.getAllAsync<Entry>(
        'SELECT * FROM entries ORDER BY date DESC'
      );
      
      set({ entries: entries || [] });
      console.log(`✅ Loaded ${entries?.length || 0} entries from local storage`);
    } catch (error) {
      console.error('❌ Failed to load entries:', error);
      set({ error: String(error), entries: [] });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Create new entry
   */
  createEntry: async (entry) => {
    try {
      console.log('➕ Creating entry:', entry);
      
      const db = getDatabase();
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `INSERT INTO entries 
         (user_id, category_id, amount, type, description, date, created_at, updated_at, synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          entry.user_id,
          entry.category_id,
          entry.amount,
          entry.type,
          entry.description || null,
          entry.date,
          now,
          now
        ]
      );
      
      const newEntry: Entry = {
        ...entry,
        id: result.lastInsertRowId as number,
        created_at: now,
        updated_at: now,
      };
      
      // Update store
      const entries = get().entries;
      set({ entries: [newEntry, ...entries] });
      
      // Save to offline data manager
      await saveDataLocally(
        'entries',
        newEntry.id.toString(),
        newEntry,
        1
      );
      
      // Queue for backend sync
      await queueForSync('entries', newEntry.id.toString(), newEntry, 'create');
      
      console.log('✅ Entry created:', newEntry.id);
      return newEntry;
    } catch (error) {
      console.error('❌ Failed to create entry:', error);
      throw error;
    }
  },

  /**
   * Update entry
   */
  updateEntry: async (id: number, updates: Partial<Entry>) => {
    try {
      console.log('✏️ Updating entry:', id);
      
      const db = getDatabase();
      const now = new Date().toISOString();
      
      // Build update query
      const updateFields = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'created_at')
        .map(key => `${key} = ?`);
      
      const updateValues = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'created_at')
        .map(key => (updates as any)[key]);
      
      updateValues.push(now); // Add updated_at
      updateValues.push(id); // Add id for WHERE clause
      
      const query = `
        UPDATE entries 
        SET ${updateFields.join(', ')}, updated_at = ? 
        WHERE id = ?
      `;
      
      await db.runAsync(query, updateValues);
      
      // Load updated entry
      const updated = await db.getFirstAsync<Entry>(
        'SELECT * FROM entries WHERE id = ?',
        [id]
      );
      
      if (updated) {
        // Update store
        const entries = get().entries.map(e => e.id === id ? updated : e);
        set({ entries });
        
        // Save to offline data manager
        await saveDataLocally('entries', id.toString(), updated, 1);
        
        // Queue for sync
        await queueForSync('entries', id.toString(), updated, 'update');
        
        console.log('✅ Entry updated:', id);
      }
    } catch (error) {
      console.error('❌ Failed to update entry:', error);
      throw error;
    }
  },

  /**
   * Delete entry
   */
  deleteEntry: async (id: number) => {
    try {
      console.log('🗑️ Deleting entry:', id);
      
      const db = getDatabase();
      
      // Soft delete (keep data but mark as deleted)
      await db.runAsync(
        'DELETE FROM entries WHERE id = ?',
        [id]
      );
      
      // Update store
      const entries = get().entries.filter(e => e.id !== id);
      set({ entries });
      
      // Queue for sync
      await queueForSync('entries', id.toString(), { id }, 'delete');
      
      console.log('✅ Entry deleted:', id);
    } catch (error) {
      console.error('❌ Failed to delete entry:', error);
      throw error;
    }
  },

  /**
   * Sync entries to backend
   */
  syncToBackend: async () => {
    try {
      console.log('🔄 Syncing entries to backend...');
      
      const db = getDatabase();
      
      // Get all unsynced entries
      const unsyncedEntries = await db.getAllAsync<Entry>(
        'SELECT * FROM entries WHERE synced = 0'
      );
      
      if (!unsyncedEntries || unsyncedEntries.length === 0) {
        console.log('ℹ️ No unsynced entries');
        return;
      }
      
      console.log(`📤 Syncing ${unsyncedEntries.length} entries...`);
      
      for (const entry of unsyncedEntries) {
        try {
          // Determine operation type
          const operation = entry.id < 0 ? 'create' : 'update';
          
          if (operation === 'create') {
            // Post new entry
            await API.post('/entries', entry);
          } else {
            // Update existing entry
            await API.put(`/entries/${entry.id}`, entry);
          }
          
          // Mark as synced
          await db.runAsync(
            'UPDATE entries SET synced = 1 WHERE id = ?',
            [entry.id]
          );
          
          console.log(`✅ Entry synced: ${entry.id}`);
        } catch (error) {
          console.warn(`⚠️ Failed to sync entry ${entry.id}:`, error);
          // Continue syncing other entries
        }
      }
      
      console.log('✅ Entries sync complete');
    } catch (error) {
      console.error('❌ Failed to sync entries:', error);
    }
  },

  /**
   * Get statistics
   */
  getStats: async (filters?: any) => {
    try {
      const db = getDatabase();
      
      let query = 'SELECT type, SUM(amount) as total FROM entries WHERE 1=1';
      const params: any[] = [];
      
      if (filters?.start_date) {
        query += ' AND date >= ?';
        params.push(filters.start_date);
      }
      
      if (filters?.end_date) {
        query += ' AND date <= ?';
        params.push(filters.end_date);
      }
      
      query += ' GROUP BY type';
      
      const results = await db.getAllAsync<{ type: string; total: number }>(query, params);
      
      let income = 0;
      let expenses = 0;
      
      results?.forEach(row => {
        if (row.type === 'income') income = row.total || 0;
        if (row.type === 'expense') expenses = row.total || 0;
      });
      
      return { income, expenses };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return { income: 0, expenses: 0 };
    }
  },
}));