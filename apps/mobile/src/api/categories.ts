import { api } from "./client";

export type ExpenseType = "mandatory" | "neutral" | "excess";

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  expense_type: ExpenseType | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  type: "income" | "expense";
  color?: string | null;
  icon?: string | null;
  expense_type?: ExpenseType | null;
}

export interface CategoryUpdate {
  name?: string;
  color?: string | null;
  icon?: string | null;
  expense_type?: ExpenseType | null;
}

export interface CategoryFilters {
  type?: "income" | "expense";
  expense_type?: ExpenseType;
}

/**
 * Get list of categories with optional filters
 */
export const getCategories = async (
  filters?: CategoryFilters
): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories", {
    params: filters,
  });
  return response.data;
};

/**
 * Get a single category by ID
 */
export const getCategory = async (id: number): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
};

/**
 * Create a new category
 */
export const createCategory = async (
  data: CategoryCreate
): Promise<Category> => {
  const response = await api.post<Category>("/categories", data);
  return response.data;
};

/**
 * Update an existing category
 */
export const updateCategory = async (
  id: number,
  data: CategoryUpdate
): Promise<Category> => {
  const response = await api.patch<Category>(`/categories/${id}`, data);
  return response.data;
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`);
};