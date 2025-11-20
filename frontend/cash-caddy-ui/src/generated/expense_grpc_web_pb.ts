// Manually created gRPC-Web client wrapper for ExpenseService
// Note: In production, this should be generated from proto file using protoc

export interface ExpenseMessage {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetExpensesRequest {}

export interface GetExpensesResponse {
  expenses: ExpenseMessage[];
}

export interface GetExpenseRequest {
  id: string;
}

export interface ExpenseResponse {
  expense: ExpenseMessage;
}

export interface CreateExpenseRequest {
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface UpdateExpenseRequest {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface DeleteExpenseRequest {
  id: string;
}

export interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}

// Simple gRPC-Web client implementation
class ExpenseServiceClient {
  private hostname: string;

  constructor(hostname: string) {
    this.hostname = hostname;
  }

  async getExpenses(request: GetExpensesRequest): Promise<GetExpensesResponse> {
    const response = await fetch(`${this.hostname}/expense.ExpenseService/GetExpenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc-web+proto',
        'X-Grpc-Web': '1',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`gRPC error: ${response.status}`);
    }
    
    return response.json();
  }

  async getExpense(request: GetExpenseRequest): Promise<ExpenseResponse> {
    const response = await fetch(`${this.hostname}/expense.ExpenseService/GetExpense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc-web+proto',
        'X-Grpc-Web': '1',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`gRPC error: ${response.status}`);
    }
    
    return response.json();
  }

  async createExpense(request: CreateExpenseRequest): Promise<ExpenseResponse> {
    const response = await fetch(`${this.hostname}/expense.ExpenseService/CreateExpense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc-web+proto',
        'X-Grpc-Web': '1',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`gRPC error: ${response.status}`);
    }
    
    return response.json();
  }

  async updateExpense(request: UpdateExpenseRequest): Promise<ExpenseResponse> {
    const response = await fetch(`${this.hostname}/expense.ExpenseService/UpdateExpense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc-web+proto',
        'X-Grpc-Web': '1',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`gRPC error: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteExpense(request: DeleteExpenseRequest): Promise<DeleteExpenseResponse> {
    const response = await fetch(`${this.hostname}/expense.ExpenseService/DeleteExpense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc-web+proto',
        'X-Grpc-Web': '1',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`gRPC error: ${response.status}`);
    }
    
    return response.json();
  }
}

export { ExpenseServiceClient };
