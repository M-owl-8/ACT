import { api } from './client';
import * as FileSystem from 'expo-file-system';

export interface Book {
  id: number;
  title: string;
  author: string | null;
  cover_url: string | null;
  summary: string | null;
  key_takeaways: string | null;
  order_index: number;
  user_progress: {
    status: 'not_started' | 'in_progress' | 'done';
    progress_percent: number;
    started_at: string | null;
    completed_at: string | null;
  } | null;
}

export interface ReadingStats {
  total_books: number;
  not_started: number;
  in_progress: number;
  completed: number;
  completion_rate: number;
  average_progress: number;
  total_time_minutes: number;
  reading_streak: number;
  recent_activity: {
    book_title: string;
    status: 'not_started' | 'in_progress' | 'done';
    progress_percent: number;
    updated_at: string;
  } | null;
  achievements: string[];
}

export interface ProgressUpdate {
  status?: 'not_started' | 'in_progress' | 'done';
  progress_percent?: number;
}

export interface SearchBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages?: number;
  cover_i?: number;
}

export interface ReadingSession {
  id: number;
  book_id: number;
  pages_read: number;
  time_spent_minutes: number;
  notes: string | null;
  session_date: string;
  created_at: string;
}

export interface BookWithSessions extends Book {
  reading_sessions?: ReadingSession[];
  total_pages?: number;
  chapters?: number;
}

export const booksApi = {
  /**
   * Get all books with user progress
   */
  async getBooks(): Promise<Book[]> {
    const response = await api.get('/books/');
    return response.data;
  },

  /**
   * Get a specific book with user progress and reading sessions
   */
  async getBook(bookId: number): Promise<BookWithSessions> {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  },

  /**
   * Update user's reading progress for a book
   */
  async updateProgress(bookId: number, data: ProgressUpdate): Promise<any> {
    const response = await api.post(`/books/${bookId}/progress`, data);
    return response.data;
  },

  /**
   * Get user's reading statistics
   */
  async getReadingStats(): Promise<ReadingStats> {
    const response = await api.get('/books/progress/stats');
    return response.data;
  },

  /**
   * Search for books on Open Library
   */
  async searchBooks(query: string): Promise<SearchBook[]> {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Failed to search books:', error);
      return [];
    }
  },

  /**
   * Create and add a new book
   */
  async createBook(data: {
    title: string;
    author?: string;
    cover_url?: string;
    summary?: string;
    total_pages?: number;
    chapters?: number;
    isbn?: string;
  }): Promise<Book> {
    const response = await api.post('/books/', data);
    return response.data;
  },

  /**
   * Add a reading session to a book
   */
  async addReadingSession(bookId: number, data: {
    pages_read: number;
    time_spent_minutes: number;
    notes?: string;
    session_date?: string;
  }): Promise<ReadingSession> {
    const response = await api.post(`/books/${bookId}/sessions`, data);
    return response.data;
  },

  /**
   * Get reading sessions for a book
   */
  async getReadingSessions(bookId: number): Promise<ReadingSession[]> {
    const response = await api.get(`/books/${bookId}/sessions`);
    return response.data;
  },

  /**
   * Delete a book
   */
  async deleteBook(bookId: number): Promise<void> {
    await api.delete(`/books/${bookId}`);
  },

  /**
   * Download PDF file for a book
   * Returns the URI to the downloaded file
   */
  async downloadPDF(bookId: number): Promise<string> {
    try {
      const response = await api.get(`/books/${bookId}/download`, {
        responseType: 'arraybuffer',
      });
      
      // Save to file system
      const fileUri = `${FileSystem.documentDirectory}book_${bookId}.pdf`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(response.data).toString('base64'),
        { encoding: 'base64' }
      );
      
      return fileUri;
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw error;
    }
  },
};