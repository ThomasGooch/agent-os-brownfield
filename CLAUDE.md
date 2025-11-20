# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + Vite + TypeScript)
Located in `frontend/cash-caddy-ui/`
- **Development server**: `npm run dev` (serves on port 5173)
- **Build**: `npm run build` (compiles TypeScript then builds)
- **Lint**: `npm run lint` (ESLint with TypeScript support)
- **Test**: `npm run test` (runs Vitest unit tests)
- **Preview**: `npm run preview` (preview production build)
- **Proto generation**: Manual via `protoc` with `ts-proto` plugin (see README for command)

### Backend (.NET 9 API)
Located in `backend/src/CashCaddy/`
- **Run**: `dotnet run` (serves REST on port 5000, gRPC on port 5001)
- **Build**: `dotnet build` (compiles and generates proto files)
- **Test**: `dotnet test` (from `backend/tests/CashCaddy.API.Tests/`)
- **Database migrations**: `dotnet ef database update` (auto-applied at startup)

### Docker Development
- **Full stack**: `docker compose up` (builds and runs all services)
- **Frontend only**: `docker compose up frontend`
- **Backend + DB**: `docker compose up backend postgres`

## Architecture Overview

### Stack
- **Frontend**: React 19 + TypeScript + Vite + Axios (REST) + gRPC-Web (gRPC)
- **Backend**: .NET 9 Web API with minimal APIs + gRPC services + Entity Framework Core
- **Database**: PostgreSQL with Entity Framework migrations
- **Containerization**: Docker with multi-service compose setup
- **Communication**: Dual protocol support - REST (JSON) and gRPC (Protocol Buffers)

### Project Structure
```
/backend/
  /src/CashCaddy/           # Main API project
    /Models/                # Entity models (Expense.cs)
    /repositories/          # Repository pattern (ExpenseRepository.cs)
    /Data/                  # DbContext (ExpenseDbContext.cs)
    /Migrations/            # EF Core migrations
    /Utilities/             # Custom converters (DateOnlyJsonConverter.cs)
    /Protos/                # Protocol Buffer definitions (expense.proto)
    /Services/              # gRPC service implementations (ExpenseGrpcService.cs)
    Program.cs              # Startup configuration + minimal APIs + gRPC
  /tests/                   # xUnit tests with NSubstitute mocking

/frontend/cash-caddy-ui/
  /src/
    /components/            # React components (ExpenseForm, Expenses)
    /services/              # API service layer (api.ts, grpc-api.ts, api-factory.ts)
    /protos/                # Protocol Buffer definitions (copied from backend)
    /generated/             # Generated gRPC-Web client code
    App.tsx                 # Main app component
```

### Backend Architecture
- **Minimal APIs**: Direct route mapping in Program.cs for REST CRUD operations
- **gRPC Services**: ExpenseGrpcService implementing ExpenseService proto contract
  - Inherits from generated `ExpenseService.ExpenseServiceBase`
  - All 5 RPC methods implemented (GetExpenses, GetExpense, CreateExpense, UpdateExpense, DeleteExpense)
  - Error handling with proper gRPC status codes
- **Repository Pattern**: IExpenseRepository interface shared by both REST and gRPC endpoints
- **Entity Framework**: PostgreSQL provider with automatic migrations
- **CORS**: Configured for localhost:5173 and localhost:5174 with gRPC-Web headers exposed
  - Custom OPTIONS middleware for preflight requests
  - `.RequireCors()` enabled on gRPC service endpoint
- **Database Seeding**: Automatic seeding with sample data on startup
- **Dual Protocol**: 
  - Port 5000: HTTP/1.1 for REST (JSON)
  - Port 5001: HTTP/1.1 + HTTP/2 for gRPC (Protocol Buffers)
  - **Important**: gRPC-Web requires HTTP/1.1 support (not just HTTP/2)

### Frontend Architecture
- **State Management**: Local React state with useState/useEffect
- **API Layer**: Protocol abstraction with feature flag switching
  - `api.ts` - REST implementation using Axios
  - `grpc-api.ts` - gRPC-Web implementation with proper message framing
    - Implements 5-byte header framing (1 byte compression + 4 bytes length)
    - Uses Protocol Buffer serialization via `@bufbuild/protobuf`
    - Generated TypeScript types from proto files with `ts-proto`
  - `api-factory.ts` - Protocol selection based on VITE_USE_GRPC env var
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Component-specific CSS files
- **Feature Flag**: VITE_USE_GRPC environment variable (default: false)
- **Code Generation**: Proto files compiled to TypeScript using `protoc` + `ts-proto`

### Database Schema
- **Expense**: Id (Guid), Date (DateTime), Amount (decimal), Description (string), Category (string)
- **Connection**: PostgreSQL with connection string in docker-compose.yml

## Development Workflow

1. **Local Development**: Use `docker compose up` to start all services
2. **Frontend Only**: Run `npm run dev` in `frontend/cash-caddy-ui/` (requires backend running)
3. **Backend Only**: Run `dotnet run` in `backend/src/CashCaddy/` (requires PostgreSQL)
4. **Testing**: Run `dotnet test` from the tests directory

## API Endpoints

### REST API (Port 5000)
- `GET /expenses` - Get all expenses
- `GET /expenses/{id}` - Get expense by ID
- `POST /expenses` - Create new expense
- `PUT /expenses/{id}` - Update existing expense
- `DELETE /expenses/{id}` - Delete expense

### gRPC API (Port 5001)
- `GetExpenses()` - Get all expenses
- `GetExpense(id)` - Get expense by ID
- `CreateExpense(expense)` - Create new expense
- `UpdateExpense(expense)` - Update existing expense
- `DeleteExpense(id)` - Delete expense

## Configuration
- **REST Backend URL**: `http://localhost:5000`
- **gRPC Backend URL**: `http://localhost:5001`
- **Protocol Selection**: Set `VITE_USE_GRPC=true` in `.env` to use gRPC (default: false)
- **Database**: PostgreSQL with credentials in docker-compose.yml
- **CORS**: Configured for React dev server (localhost:5173) with gRPC-Web headers

## Protocol Switching
To switch between REST and gRPC:
1. Edit `frontend/cash-caddy-ui/.env`
2. Set `VITE_USE_GRPC=false` for REST or `VITE_USE_GRPC=true` for gRPC
3. Restart frontend dev server
4. Both protocols use the same repository layer and business logic

## gRPC Implementation Notes

### Code Generation

**Backend (Automatic):**
- Proto files in `backend/src/CashCaddy/Protos/expense.proto`
- C# code generated automatically via `Grpc.Tools` during `dotnet build`
- Generated base classes in `obj/` directory

**Frontend (Manual when proto changes):**
```bash
cd frontend/cash-caddy-ui
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=src/generated \
  --ts_proto_opt=env=browser,outputServices=generic-definitions,esModuleInterop=true \
  -I=src/protos expense.proto
```
- Requires: `protoc` (via Homebrew), `ts-proto`, `@bufbuild/protobuf` npm packages
- Generated files committed to git for CI/CD compatibility

### gRPC-Web Message Framing

The frontend implements proper gRPC-Web binary framing:

**Request Frame Structure:**
```
[Compression Flag: 1 byte (0x00)]
[Message Length: 4 bytes big-endian]
[Protocol Buffer Data: N bytes]
```

**Implementation:**
- `frameMessage()` function adds 5-byte header before sending
- `unframeMessage()` function extracts message from response
- Content-Type: `application/grpc-web+proto`
- Proper ArrayBuffer handling for binary data

### CORS Configuration

Critical for gRPC-Web browser clients:
- Backend uses `UseRouting()` before CORS middleware
- Custom OPTIONS handler for preflight requests
- `.EnableGrpcWeb()` and `.RequireCors()` on gRPC service mapping
- Kestrel configured with `"Http1AndHttp2"` protocol (not just `"Http2"`)
- gRPC-Web clients use HTTP/1.1, not HTTP/2

### Testing

**Unit Tests:** 10 tests in `frontend/cash-caddy-ui/src/__tests__/api-integration.test.ts`
- Protocol switching validation
- gRPC client initialization
- REST client configuration
- Type safety checks
- All tests passing ✅

**Run tests:** `npm run test` in frontend directory