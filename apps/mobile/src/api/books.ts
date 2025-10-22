import { api } from './client';

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
}

export interface ProgressUpdate {
  status?: 'not_started' | 'in_progress' | 'done';
  progress_percent?: number;
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
   * Get a specific book with user progress
   */
  async getBook(bookId: number): Promise<Book> {
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
};