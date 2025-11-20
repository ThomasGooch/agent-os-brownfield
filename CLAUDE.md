# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + Vite + TypeScript)
Located in `frontend/cash-caddy-ui/`
- **Development server**: `npm run dev` (serves on port 5173)
- **Build**: `npm run build` (compiles TypeScript then builds)
- **Lint**: `npm run lint` (ESLint with TypeScript support)
- **Preview**: `npm run preview` (preview production build)
- **Proto generation**: `npm run proto:generate` (generates TypeScript gRPC client from proto files)

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
- **Repository Pattern**: IExpenseRepository interface shared by both REST and gRPC endpoints
- **Entity Framework**: PostgreSQL provider with automatic migrations
- **CORS**: Configured for localhost:5173 with gRPC-Web headers exposed
- **Database Seeding**: Automatic seeding with sample data on startup
- **Dual Protocol**: HTTP/1.1 on port 5000 (REST), HTTP/2 on port 5001 (gRPC)

### Frontend Architecture
- **State Management**: Local React state with useState/useEffect
- **API Layer**: Protocol abstraction with feature flag switching
  - `api.ts` - REST implementation using Axios
  - `grpc-api.ts` - gRPC-Web implementation
  - `api-factory.ts` - Protocol selection based on VITE_USE_GRPC env var
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Component-specific CSS files
- **Feature Flag**: VITE_USE_GRPC environment variable (default: false)

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