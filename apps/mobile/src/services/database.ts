/**
 * Local SQLite Database Service
 * Standalone version - no backend required!
 */
import * as SQLite from 'expo-sqlite';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables
 */
export async function initDatabase(): Promise<void> {
  try {
    console.log('📦 Initializing local database...');
    
    // Open database (creates if doesn't exist)
    db = await SQLite.openDatabaseAsync('act_gen1.db');
    
    console.log('✅ Database opened successfully');
    
    // Create tables
    await createTables();
    
    // Seed default data if needed
    await seedDefaultData();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Create all necessary tables
 */
async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  console.log('📋 Creating tables...');
  
  // Users table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Categories table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT,
      color TEXT,
      is_default INTEGER DEFAULT 0,
      expense_type TEXT DEFAULT 'mandatory' CHECK(expense_type IN ('mandatory', 'neutral', 'excess')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  // Entries table (income/expense transactions)
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
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);
  
  // Books table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      description TEXT,
      cover_url TEXT,
      category TEXT,
      rating REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✅ Tables created');
}

/**
 * Seed default categories and books
 */
async function seedDefaultData(): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  // Check if we already have data
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  
  if (result && result.count > 0) {
    console.log('ℹ️ Default data already exists');
    return;
  }
  
  console.log('🌱 Seeding default data...');
  
  // Default expense categories with expense type classification
  const expenseCategories = [
    { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B', expense_type: 'mandatory' },
    { name: 'Transportation', icon: '🚗', color: '#4ECDC4', expense_type: 'mandatory' },
    { name: 'Bills & Utilities', icon: '💡', color: '#AA96DA', expense_type: 'mandatory' },
    { name: 'Healthcare', icon: '🏥', color: '#FCBAD3', expense_type: 'mandatory' },
    { name: 'Education', icon: '📚', color: '#A8D8EA', expense_type: 'neutral' },
    { name: 'Shopping', icon: '🛍️', color: '#95E1D3', expense_type: 'neutral' },
    { name: 'Entertainment', icon: '🎬', color: '#F38181', expense_type: 'excess' },
    { name: 'Other', icon: '📦', color: '#C7CEEA', expense_type: 'neutral' },
  ];
  
  // Default income categories
  const incomeCategories = [
    { name: 'Salary', icon: '💰', color: '#6BCF7F' },
    { name: 'Freelance', icon: '💼', color: '#4D96FF' },
    { name: 'Investment', icon: '📈', color: '#FFD93D' },
    { name: 'Gift', icon: '🎁', color: '#FF6B9D' },
    { name: 'Other', icon: '💵', color: '#95E1D3' },
  ];
  
  // Insert expense categories (user_id = 0 for default/system categories)
  for (const cat of expenseCategories) {
    await db.runAsync(
      'INSERT INTO categories (user_id, name, type, icon, color, is_default, expense_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [0, cat.name, 'expense', cat.icon, cat.color, 1, cat.expense_type]
    );
  }
  
  // Insert income categories
  for (const cat of incomeCategories) {
    await db.runAsync(
      'INSERT INTO categories (user_id, name, type, icon, color, is_default, expense_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [0, cat.name, 'income', cat.icon, cat.color, 1, 'neutral']
    );
  }
  
  console.log('✅ Default categories seeded');
  
  // Seed some sample books
  const books = [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
      category: 'Self-Help',
      rating: 4.8
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      description: 'Timeless lessons on wealth, greed, and happiness',
      category: 'Finance',
      rating: 4.7
    },
    {
      title: 'Deep Work',
      author: 'Cal Newport',
      description: 'Rules for Focused Success in a Distracted World',
      category: 'Productivity',
      rating: 4.6
    }
  ];
  
  for (const book of books) {
    await db.runAsync(
      'INSERT INTO books (title, author, description, category, rating) VALUES (?, ?, ?, ?, ?)',
      [book.title, book.author, book.description, book.category, book.rating]
    );
  }
  
  console.log('✅ Sample books seeded');
}

/**
 * Get database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('✅ Database closed');
  }
}

// Export types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  is_default: number;
  expense_type: 'mandatory' | 'neutral' | 'excess';
  created_at: string;
}

export interface Entry {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  description?: string;
  cover_url?: string;
  category?: string;
  rating?: number;
  created_at: string;
}

/**
 * Get categories by type (income or expense)
 */
export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  const database = getDatabase();
  if (type) {
    return await database.getAllAsync<Category>(
      'SELECT * FROM categories WHERE type = ? ORDER BY name',
      [type]
    );
  }
  return await database.getAllAsync<Category>('SELECT * FROM categories ORDER BY name');
}

/**
 * Create or update entry
 */
export async function createEntry(entry: Omit<Entry, 'id' | 'created_at' | 'updated_at'>): Promise<Entry> {
  const database = getDatabase();
  const now = new Date().toISOString();
  
  const result = await database.runAsync(
    'INSERT INTO entries (user_id, category_id, amount, type, description, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [entry.user_id, entry.category_id, entry.amount, entry.type, entry.description || null, entry.date, now, now]
  );
  
  return {
    ...entry,
    id: result.lastInsertRowId as number,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Get entries with optional filters
 */
export async function getEntries(filters?: {
  user_id?: number;
  type?: 'income' | 'expense';
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<Entry[]> {
  const database = getDatabase();
  let query = 'SELECT * FROM entries WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.user_id !== undefined) {
    query += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters?.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters?.start_date) {
    query += ' AND date >= ?';
    params.push(filters.start_date);
  }
  if (filters?.end_date) {
    query += ' AND date <= ?';
    params.push(filters.end_date);
  }
  
  query += ' ORDER BY date DESC';
  
  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  return await database.getAllAsync<Entry>(query, params);
}

/**
 * Get entry totals
 */
export async function getEntryTotals(filters?: {
  user_id?: number;
  type?: 'income' | 'expense';
  start_date?: string;
  end_date?: string;
}): Promise<{ total: number; count: number }> {
  const database = getDatabase();
  let query = 'SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM entries WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.user_id !== undefined) {
    query += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters?.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters?.start_date) {
    query += ' AND date >= ?';
    params.push(filters.start_date);
  }
  if (filters?.end_date) {
    query += ' AND date <= ?';
    params.push(filters.end_date);
  }
  
  const result = await database.getFirstAsync<{ total: number; count: number }>(query, params);
  return result || { total: 0, count: 0 };
}