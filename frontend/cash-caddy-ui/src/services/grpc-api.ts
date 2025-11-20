import { ExpenseServiceClient, type ExpenseMessage, type CreateExpenseRequest, type UpdateExpenseRequest } from '../generated/expense_grpc_web_pb';

const grpcUrl = 'http://localhost:5001';
const client = new ExpenseServiceClient(grpcUrl);

export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await client.getExpenses({});
    return response.expenses.map((exp: ExpenseMessage) => ({
      id: exp.id,
      date: exp.date,
      amount: exp.amount,
      description: exp.description,
      category: exp.category,
    }));
  } catch (error) {
    console.error('gRPC getExpenses error:', error);
    throw error;
  }
};

export const getExpenseById = async (id: string): Promise<Expense> => {
  try {
    const response = await client.getExpense({ id });
    const exp = response.expense;
    return {
      id: exp.id,
      date: exp.date,
      amount: exp.amount,
      description: exp.description,
      category: exp.category,
    };
  } catch (error) {
    console.error('gRPC getExpenseById error:', error);
    throw error;
  }
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  try {
    const request: CreateExpenseRequest = {
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
    };
    const response = await client.createExpense(request);
    const exp = response.expense;
    return {
      id: exp.id,
      date: exp.date,
      amount: exp.amount,
      description: exp.description,
      category: exp.category,
    };
  } catch (error) {
    console.error('gRPC createExpense error:', error);
    throw error;
  }
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id'>): Promise<Expense> => {
  try {
    const request: UpdateExpenseRequest = {
      id,
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
    };
    const response = await client.updateExpense(request);
    const exp = response.expense;
    return {
      id: exp.id,
      date: exp.date,
      amount: exp.amount,
      description: exp.description,
      category: exp.category,
    };
  } catch (error) {
    console.error('gRPC updateExpense error:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await client.deleteExpense({ id });
  } catch (error) {
    console.error('gRPC deleteExpense error:', error);
    throw error;
  }
};
