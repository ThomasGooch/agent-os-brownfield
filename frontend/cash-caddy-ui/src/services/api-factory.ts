import type { Expense } from './api';
import * as restApi from './api';
import * as grpcApi from './grpc-api';

// Read feature flag from environment
const useGrpc = import.meta.env.VITE_USE_GRPC === 'true';

// Export the selected API implementation
export const getExpenses = useGrpc ? grpcApi.getExpenses : restApi.getExpenses;
export const getExpenseById = useGrpc ? grpcApi.getExpenseById : restApi.getExpenseById;
export const createExpense = useGrpc ? grpcApi.createExpense : restApi.createExpense;
export const updateExpense = useGrpc ? grpcApi.updateExpense : restApi.updateExpense;
export const deleteExpense = useGrpc ? grpcApi.deleteExpense : restApi.deleteExpense;

export type { Expense };
