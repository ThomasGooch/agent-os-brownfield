import { 
  GetExpensesRequest,
  GetExpenseRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  DeleteExpenseRequest,
  GetExpensesResponse,
  ExpenseResponse,
  DeleteExpenseResponse,
  type ExpenseMessage
} from '../generated/expense';

const grpcUrl = import.meta.env.VITE_GRPC_URL || 'http://localhost:5001';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

// Helper to convert ExpenseMessage to Expense
const toExpense = (msg: ExpenseMessage): Expense => ({
  id: msg.id,
  date: msg.date,
  amount: msg.amount,
  description: msg.description,
  category: msg.category,
});

// Helper function to add gRPC-Web framing to message
function frameMessage(data: Uint8Array): Uint8Array {
  // gRPC-Web frame format: [compressed-flag: 1 byte][length: 4 bytes][data]
  const frame = new Uint8Array(5 + data.length);
  frame[0] = 0; // Compressed flag: 0 = not compressed
  // Length in big-endian (network byte order)
  const length = data.length;
  frame[1] = (length >> 24) & 0xff;
  frame[2] = (length >> 16) & 0xff;
  frame[3] = (length >> 8) & 0xff;
  frame[4] = length & 0xff;
  frame.set(data, 5);
  return frame;
}

// Helper function to extract message from gRPC-Web frame
function unframeMessage(data: Uint8Array): Uint8Array {
  // Skip 5-byte header (1 byte compression flag + 4 bytes length)
  if (data.length < 5) {
    throw new Error('Invalid gRPC-Web frame: too short');
  }
  // Extract length from bytes 1-4
  const length = (data[1] << 24) | (data[2] << 16) | (data[3] << 8) | data[4];
  // Return the message data after the header
  return data.slice(5, 5 + length);
}

// Helper function to make gRPC-Web requests
async function grpcRequest<TRequest, TResponse>(
  method: string,
  requestEncoder: (msg: TRequest) => Uint8Array,
  responseDecoder: (bytes: Uint8Array) => TResponse,
  request: TRequest
): Promise<TResponse> {
  const messageBytes = requestEncoder(request);
  const framedMessage = frameMessage(messageBytes);
  
  // Create a proper ArrayBuffer copy
  const buffer = new ArrayBuffer(framedMessage.length);
  const view = new Uint8Array(buffer);
  view.set(framedMessage);
  
  const response = await fetch(`${grpcUrl}/expense.ExpenseService/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/grpc-web+proto',
      'X-Grpc-Web': '1',
    },
    body: buffer,
    mode: 'cors',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`gRPC request failed: ${response.status} ${response.statusText}`);
  }

  const responseBytes = new Uint8Array(await response.arrayBuffer());
  const unframedResponse = unframeMessage(responseBytes);
  return responseDecoder(unframedResponse);
}

export const getExpenses = async (): Promise<Expense[]> => {
  const request = GetExpensesRequest.create({});
  const response = await grpcRequest(
    'GetExpenses',
    (req) => GetExpensesRequest.encode(req).finish(),
    (bytes) => GetExpensesResponse.decode(bytes),
    request
  );
  return response.expenses.map(toExpense);
};

export const getExpenseById = async (id: string): Promise<Expense> => {
  const request = GetExpenseRequest.create({ id });
  const response = await grpcRequest(
    'GetExpense',
    (req) => GetExpenseRequest.encode(req).finish(),
    (bytes) => ExpenseResponse.decode(bytes),
    request
  );
  
  if (!response.expense) {
    throw new Error('Expense not found');
  }
  
  return toExpense(response.expense);
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const request = CreateExpenseRequest.create({
    date: expense.date,
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
  });
  
  const response = await grpcRequest(
    'CreateExpense',
    (req) => CreateExpenseRequest.encode(req).finish(),
    (bytes) => ExpenseResponse.decode(bytes),
    request
  );
  
  if (!response.expense) {
    throw new Error('Failed to create expense');
  }
  
  return toExpense(response.expense);
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const request = UpdateExpenseRequest.create({
    id,
    date: expense.date,
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
  });
  
  const response = await grpcRequest(
    'UpdateExpense',
    (req) => UpdateExpenseRequest.encode(req).finish(),
    (bytes) => ExpenseResponse.decode(bytes),
    request
  );
  
  if (!response.expense) {
    throw new Error('Failed to update expense');
  }
  
  return toExpense(response.expense);
};

export const deleteExpense = async (id: string): Promise<void> => {
  const request = DeleteExpenseRequest.create({ id });
  await grpcRequest(
    'DeleteExpense',
    (req) => DeleteExpenseRequest.encode(req).finish(),
    (bytes) => DeleteExpenseResponse.decode(bytes),
    request
  );
};
