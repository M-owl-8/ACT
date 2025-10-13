import { api } from "./client";

export interface Entry {
  id: number;
  user_id: number;
  category_id: number | null;
  type: "income" | "expense";
  amount: number;
  currency: string;
  note: string | null;
  booked_at: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    type: "income" | "expense";
    color: string | null;
    icon: string | null;
    expense_type?: "mandatory" | "neutral" | "excess" | null;
  } | null;
}

export interface EntryCreate {
  type: "income" | "expense";
  category_id?: number | null;
  amount: number;
  currency?: string;
  note?: string | null;
  booked_at: string; // ISO datetime string
}

export interface EntryUpdate {
  category_id?: number | null;
  amount?: number;
  currency?: string;
  note?: string | null;
  booked_at?: string;
}

export interface EntryTotals {
  total: number;
  count: number;
  type: string;
  start_date: string | null;
  end_date: string | null;
}

export interface ExpenseTypeStats {
  mandatory: { total: number; count: number };
  neutral: { total: number; count: number };
  excess: { total: number; count: number };
  total: number;
  count: number;
}

export interface EntryFilters {
  type?: "income" | "expense";
  category_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get list of entries with optional filters
 */
export const getEntries = async (filters?: EntryFilters): Promise<Entry[]> => {
  const response = await api.get<Entry[]>("/entries", { params: filters });
  return response.data;
};

/**
 * Get a single entry by ID
 */
export const getEntry = async (id: number): Promise<Entry> => {
  const response = await api.get<Entry>(`/entries/${id}`);
  return response.data;
};

/**
 * Create a new entry
 */
export const createEntry = async (data: EntryCreate): Promise<Entry> => {
  const response = await api.post<Entry>("/entries", data);
  return response.data;
};

/**
 * Update an existing entry
 */
export const updateEntry = async (
  id: number,
  data: EntryUpdate
): Promise<Entry> => {
  const response = await api.patch<Entry>(`/entries/${id}`, data);
  return response.data;
};

/**
 * Delete an entry
 */
export const deleteEntry = async (id: number): Promise<void> => {
  await api.delete(`/entries/${id}`);
};

/**
 * Get totals for entries with filters
 */
export const getEntryTotals = async (
  filters?: EntryFilters
): Promise<EntryTotals> => {
  const response = await api.get<EntryTotals>("/entries/stats/totals", {
    params: filters,
  });
  return response.data;
};

/**
 * Get expense totals grouped by expense type
 */
export const getExpenseTypeStats = async (filters?: {
  start_date?: string;
  end_date?: string;
}): Promise<ExpenseTypeStats> => {
  const response = await api.get<ExpenseTypeStats>(
    "/entries/stats/by-expense-type",
    { params: filters }
  );
  return response.data;
};