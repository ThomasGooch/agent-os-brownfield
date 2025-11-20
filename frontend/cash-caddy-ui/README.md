# CashCaddy Frontend

React + TypeScript expense tracker with dual protocol support (REST + gRPC).

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** for fast builds and HMR
- **Vitest** for unit testing
- **Axios** for REST API calls
- **gRPC-Web** with Protocol Buffers for gRPC calls
- **ts-proto** for TypeScript code generation from proto files

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
# Runs on http://localhost:5173 (or 5174 if 5173 is in use)
```

### Environment Configuration

Create a `.env` file to control protocol selection:

```bash
# Use REST API (default)
VITE_USE_GRPC=false

# Use gRPC API
VITE_USE_GRPC=true
```

**Note:** Changes to `.env` require restarting the dev server.

## Project Structure

```
src/
├── components/          # React components
│   ├── ExpenseForm.tsx  # Create/update expense form
│   └── Expenses.tsx     # Expense list display
├── services/            # API abstraction layer
│   ├── api.ts           # REST API client (Axios)
│   ├── grpc-api.ts      # gRPC API client (Protocol Buffers)
│   └── api-factory.ts   # Protocol switcher (reads VITE_USE_GRPC)
├── protos/              # Protocol Buffer definitions
│   └── expense.proto    # Expense service definition
├── generated/           # Auto-generated from proto files
│   └── expense.ts       # TypeScript types and service definitions
└── __tests__/           # Unit tests
    └── api-integration.test.ts
```

## Protocol Abstraction

The application uses a factory pattern to switch between REST and gRPC:

```typescript
// api-factory.ts reads VITE_USE_GRPC and exports the appropriate client
import api from './services/api-factory';

// Components use the abstraction - works with both protocols
const expenses = await api.getExpenses();
```

## gRPC Implementation

### Protocol Buffer Code Generation

When the proto file changes, regenerate TypeScript code:

```bash
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=src/generated \
  --ts_proto_opt=env=browser,outputServices=generic-definitions,esModuleInterop=true \
  -I=src/protos expense.proto
```

### gRPC-Web Framing

The gRPC client implements proper gRPC-Web message framing:

- **5-byte header**: 1 byte compression flag + 4 bytes message length (big-endian)
- **Message body**: Serialized Protocol Buffer data
- **Content-Type**: `application/grpc-web+proto`

```typescript
// Frame structure: [0][length: 4 bytes][protobuf data]
function frameMessage(data: Uint8Array): Uint8Array {
  const frame = new Uint8Array(5 + data.length);
  frame[0] = 0; // Not compressed
  // Length in big-endian
  frame[1] = (length >> 24) & 0xff;
  frame[2] = (length >> 16) & 0xff;
  frame[3] = (length >> 8) & 0xff;
  frame[4] = length & 0xff;
  frame.set(data, 5);
  return frame;
}
```

## Available Scripts

### `npm run dev`
Starts the development server with hot module replacement.

### `npm run build`
Builds the production bundle to `dist/`.

### `npm run preview`
Preview the production build locally.

### `npm run lint`
Runs ESLint to check code quality.

### `npm run test`
Runs unit tests with Vitest.

## Testing

The project includes comprehensive unit tests:

```bash
npm run test
```

**Test Coverage:**
- Protocol switching (REST vs gRPC)
- gRPC client initialization
- REST API client configuration
- Type safety and interface compatibility

**Test Results:** 10/10 tests passing ✅

## Backend Connection

- **REST API**: `http://localhost:5000`
- **gRPC API**: `http://localhost:5001`

Ensure the backend is running before starting the frontend.

## Troubleshooting

### CORS Errors with gRPC

If you see CORS errors when using gRPC mode:
1. Verify backend is running on port 5001
2. Check backend CORS configuration includes your frontend origin
3. Ensure backend supports HTTP/1.1 (gRPC-Web requirement)

### "Incomplete message" Errors

This indicates improper gRPC-Web framing. The implementation includes proper 5-byte headers - ensure you're using the latest code.

### Proto File Changes Not Reflected

If proto changes don't appear:
1. Regenerate TypeScript code (see Protocol Buffer Code Generation above)
2. Restart the dev server
3. Clear browser cache

## Performance Comparison

**REST (JSON):**
- Larger payload sizes (text-based)
- Human-readable
- Easier debugging

**gRPC (Protobuf):**
- Smaller payload sizes (binary)
- Faster serialization
- Type-safe contracts
- Requires code generation

## Contributing

This project follows the agent-os workflow system. See `../../agent-os/` for specifications and development standards.
