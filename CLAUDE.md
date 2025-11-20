# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + Vite + TypeScript)
Located in `frontend/cash-caddy-ui/`
- **Development server**: `npm run dev` (serves on port 5173)
- **Build**: `npm run build` (compiles TypeScript then builds)
- **Lint**: `npm run lint` (ESLint with TypeScript support)
- **Preview**: `npm run preview` (preview production build)

### Backend (.NET 9 API)
Located in `backend/src/CashCaddy/`
- **Run**: `dotnet run` (serves on port 8080 in container, 5000 externally)
- **Build**: `dotnet build`
- **Test**: `dotnet test` (from `backend/tests/CashCaddy.API.Tests/`)
- **Database migrations**: `dotnet ef database update` (auto-applied at startup)

### Docker Development
- **Full stack**: `docker compose up` (builds and runs all services)
- **Frontend only**: `docker compose up frontend`
- **Backend + DB**: `docker compose up backend postgres`

## Architecture Overview

### Stack
- **Frontend**: React 19 + TypeScript + Vite + Axios for API calls
- **Backend**: .NET 9 Web API with minimal APIs + Entity Framework Core
- **Database**: PostgreSQL with Entity Framework migrations
- **Containerization**: Docker with multi-service compose setup

### Project Structure
```
/backend/
  /src/CashCaddy/           # Main API project
    /Models/                # Entity models (Expense.cs)
    /repositories/          # Repository pattern (ExpenseRepository.cs)
    /Data/                  # DbContext (ExpenseDbContext.cs)
    /Migrations/            # EF Core migrations
    /Utilities/             # Custom converters (DateOnlyJsonConverter.cs)
    Program.cs              # Startup configuration + minimal APIs
  /tests/                   # xUnit tests with NSubstitute mocking

/frontend/cash-caddy-ui/
  /src/
    /components/            # React components (ExpenseForm, Expenses)
    /services/              # API service layer (api.ts)
    App.tsx                 # Main app component
```

### Backend Architecture
- **Minimal APIs**: Direct route mapping in Program.cs for CRUD operations
- **Repository Pattern**: IExpenseRepository interface with ExpenseRepository implementation
- **Entity Framework**: PostgreSQL provider with automatic migrations
- **CORS**: Configured for localhost:5173 (React dev server)
- **Database Seeding**: Automatic seeding with sample data on startup

### Frontend Architecture
- **State Management**: Local React state with useState/useEffect
- **API Layer**: Centralized axios-based service in `services/api.ts`
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Component-specific CSS files

### Database Schema
- **Expense**: Id (Guid), Date (DateTime), Amount (decimal), Description (string), Category (string)
- **Connection**: PostgreSQL with connection string in docker-compose.yml

## Development Workflow

1. **Local Development**: Use `docker compose up` to start all services
2. **Frontend Only**: Run `npm run dev` in `frontend/cash-caddy-ui/` (requires backend running)
3. **Backend Only**: Run `dotnet run` in `backend/src/CashCaddy/` (requires PostgreSQL)
4. **Testing**: Run `dotnet test` from the tests directory

## API Endpoints
- `GET /expenses` - Get all expenses
- `GET /expenses/{id}` - Get expense by ID
- `POST /expenses` - Create new expense
- `PUT /expenses/{id}` - Update existing expense
- `DELETE /expenses/{id}` - Delete expense

## Configuration
- **Backend URL**: Hardcoded to `http://localhost:5000` in frontend
- **Database**: PostgreSQL with credentials in docker-compose.yml
- **CORS**: Configured for React dev server (localhost:5173)