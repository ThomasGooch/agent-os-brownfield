import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await axios.get(`${backendUrl}/expenses`);
  return response.data;
};

export const getExpenseById = async (id: string): Promise<Expense> => {
  const response = await axios.get(`${backendUrl}/expenses/${id}`);
  return response.data;
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const response = await axios.post(`${backendUrl}/expenses`, expense);
  return response.data;
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const response = await axios.put(`${backendUrl}/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const response = await axios.delete(`${backendUrl}/expenses/${id}`);
  return response.data;
};