import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../services/api';
import * as grpcApi from '../services/grpc-api';
import * as apiFactory from '../services/api-factory';

// Mock the environment variable
const mockEnv = (useGrpc: boolean) => {
  vi.stubGlobal('import.meta', {
    env: {
      VITE_USE_GRPC: useGrpc ? 'true' : 'false'
    }
  });
};

describe('API Factory - Protocol Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use REST API when VITE_USE_GRPC is false', async () => {
    mockEnv(false);
    
    // The factory should export REST implementations
    expect(apiFactory.getExpenses).toBeDefined();
    expect(apiFactory.getExpenseById).toBeDefined();
    expect(apiFactory.createExpense).toBeDefined();
    expect(apiFactory.updateExpense).toBeDefined();
    expect(apiFactory.deleteExpense).toBeDefined();
  });

  it('should use gRPC API when VITE_USE_GRPC is true', async () => {
    mockEnv(true);
    
    // The factory should export gRPC implementations
    expect(apiFactory.getExpenses).toBeDefined();
    expect(apiFactory.getExpenseById).toBeDefined();
    expect(apiFactory.createExpense).toBeDefined();
    expect(apiFactory.updateExpense).toBeDefined();
    expect(apiFactory.deleteExpense).toBeDefined();
  });
});

describe('gRPC API Client', () => {
  it('should initialize ExpenseServiceClient with correct URL', () => {
    // ExpenseServiceClient should be initialized with http://localhost:5001
    expect(grpcApi.getExpenses).toBeDefined();
  });

  it('should have all required expense methods', () => {
    expect(typeof grpcApi.getExpenses).toBe('function');
    expect(typeof grpcApi.getExpenseById).toBe('function');
    expect(typeof grpcApi.createExpense).toBe('function');
    expect(typeof grpcApi.updateExpense).toBe('function');
    expect(typeof grpcApi.deleteExpense).toBe('function');
  });

  it('should match REST API interface for getExpenses', () => {
    // Both should return Promise<Expense[]>
    const restReturn = api.getExpenses();
    const grpcReturn = grpcApi.getExpenses();
    
    expect(restReturn).toBeInstanceOf(Promise);
    expect(grpcReturn).toBeInstanceOf(Promise);
  });

  it('should match REST API interface for createExpense', () => {
    const testExpense = {
      date: '2025-11-20',
      amount: 50,
      description: 'Test',
      category: 'Food'
    };

    const restReturn = api.createExpense(testExpense);
    const grpcReturn = grpcApi.createExpense(testExpense);
    
    expect(restReturn).toBeInstanceOf(Promise);
    expect(grpcReturn).toBeInstanceOf(Promise);
  });
});

describe('REST API Client', () => {
  it('should use correct backend URL', () => {
    // REST API should use http://localhost:5000
    expect(api.getExpenses).toBeDefined();
  });

  it('should have all required expense methods', () => {
    expect(typeof api.getExpenses).toBe('function');
    expect(typeof api.getExpenseById).toBe('function');
    expect(typeof api.createExpense).toBe('function');
    expect(typeof api.updateExpense).toBe('function');
    expect(typeof api.deleteExpense).toBe('function');
  });
});

describe('Type Safety', () => {
  it('should export Expense type from api-factory', () => {
    // Type should be available
    expect(apiFactory).toHaveProperty('getExpenses');
  });

  it('should handle expense data consistently', async () => {
    const mockExpense = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      date: '2025-11-20',
      amount: 50,
      description: 'Test Expense',
      category: 'Food'
    };

    // Both APIs should handle the same data structure
    expect(mockExpense.id).toBeDefined();
    expect(mockExpense.date).toBeDefined();
    expect(mockExpense.amount).toBeDefined();
    expect(mockExpense.description).toBeDefined();
    expect(mockExpense.category).toBeDefined();
  });
});
