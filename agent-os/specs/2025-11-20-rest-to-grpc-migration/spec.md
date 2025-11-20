# Specification: REST to gRPC Migration

## Goal
Migrate Cash Caddy from HTTP REST/JSON to gRPC/Protocol Buffers while maintaining both protocols in parallel, controlled by an app-level feature flag, to improve performance and type safety without breaking existing functionality.

## User Stories
- As a developer, I want both REST and gRPC protocols available so I can safely validate gRPC functionality before full migration
- As a developer, I want a feature flag to toggle protocols so I can instantly rollback if issues occur
- As a system, I want improved communication efficiency through binary protocol buffers to reduce payload sizes and latency

## Specific Requirements

**Protocol Buffer Schema Definition**
- Create `backend/src/CashCaddy/Protos/expense.proto` with proto3 syntax
- Define `ExpenseService` service with 5 RPC methods: GetExpenses, GetExpense, CreateExpense, UpdateExpense, DeleteExpense
- Define `ExpenseMessage` mirroring Expense entity: id (string), date (string), amount (double), description (string), category (string)
- Define request/response messages for each operation (GetExpensesRequest/Response, CreateExpenseRequest, etc.)
- Use `repeated ExpenseMessage` for list responses
- Keep schema aligned with existing `Models/Expense.cs` structure

**Backend gRPC Service Implementation**
- Add NuGet packages: `Grpc.AspNetCore`, `Grpc.AspNetCore.Web`, `Google.Protobuf`, `Grpc.Tools` to CashCaddy.API.csproj
- Create `Services/ExpenseGrpcService.cs` implementing ExpenseService from generated proto
- Inject existing `IExpenseRepository` into gRPC service (reuse data layer)
- Map between protobuf messages and Expense entity (bidirectional conversion)
- Implement all 5 RPC methods delegating to repository
- Handle exceptions and return appropriate gRPC status codes
- Configure gRPC in Program.cs: add gRPC services, enable gRPC-Web middleware, configure Kestrel for HTTP/2
- Run gRPC on port 5001 (keep REST on 5000)

**Backend Configuration Updates**
- Update `appsettings.json` to configure port 5001 for gRPC alongside port 5000 for REST
- Configure CORS for gRPC-Web allowing localhost:5173 origin
- Enable HTTP/2 protocol support in Kestrel configuration
- Ensure both protocols can run simultaneously without conflicts

**Frontend gRPC Client Setup**
- Add npm packages: `grpc-web`, `google-protobuf`, `@types/google-protobuf`
- Add dev dependencies: `grpc-tools`, `grpc_tools_node_protoc_ts`
- Copy `.proto` file to `frontend/cash-caddy-ui/src/protos/expense.proto`
- Add npm script `"proto:generate"` to generate TypeScript client from proto
- Configure script to output to `src/generated/` directory
- Add `src/generated/` to `.gitignore`

**Frontend Protocol Abstraction Layer**
- Create `src/services/grpc-api.ts` implementing gRPC client
- Initialize gRPC-Web client pointing to `http://localhost:5001`
- Implement wrapper methods matching existing api.ts interface: getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense
- Create `src/services/api-factory.ts` that reads `VITE_USE_GRPC` environment variable
- Export single API instance that delegates to REST or gRPC based on flag
- Update component imports to use factory instead of direct api.ts import

**Feature Flag Configuration**
- Add `VITE_USE_GRPC` environment variable to `.env` and `.env.example` files
- Default value: `false` (use REST by default for safety)
- Read flag at application startup in main.tsx or api-factory.ts
- No runtime switching required - flag read once at initialization
- Document flag usage in README.md

**Docker Configuration Updates**
- Update `docker-compose.yml` backend service to expose port 5001
- Map host port 5001 to container port 5001 for gRPC
- Keep existing port 5000 mapping for REST
- No Envoy proxy needed (using ASP.NET Core middleware)

**Testing Implementation**
- Add xUnit tests in `backend/tests/CashCaddy.API.Tests/` for gRPC service methods
- Test each RPC method (GetExpenses, GetExpense, CreateExpense, UpdateExpense, DeleteExpense)
- Mock IExpenseRepository for unit testing
- Verify protobuf message mapping is correct
- Test error scenarios (not found, validation errors)
- Manual browser testing for gRPC-Web client functionality

## Existing Code to Leverage

**`backend/src/CashCaddy/repositories/IExpenseRepository.cs` and ExpenseRepository.cs**
- Repository pattern already implemented with GetAll, GetById, Create, Update, Delete methods
- Reuse directly in gRPC service without modifications
- Already injected via DI in Program.cs with `AddScoped<IExpenseRepository, ExpenseRepository>()`

**`backend/src/CashCaddy/Models/Expense.cs`**
- Entity structure: Guid Id, DateTime Date, decimal Amount, string? Description, string? Category
- Use as reference for protobuf message field definitions
- Map directly between entity and protobuf message in gRPC service

**`backend/src/CashCaddy/Program.cs` minimal API patterns**
- CORS configuration for localhost:5173 already implemented
- Follow similar DI registration patterns for gRPC services
- Maintain existing REST endpoints alongside new gRPC configuration

**`frontend/cash-caddy-ui/src/services/api.ts` REST service structure**
- Five methods: getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense
- Mirror exact same interface in grpc-api.ts for seamless switching
- Reuse error handling patterns and response data structures

**`backend/tests/CashCaddy.API.Tests/` existing test structure**
- Follow existing test patterns and conventions
- Use same mocking approach (NSubstitute if already in use)
- Maintain consistent test naming and organization

## Out of Scope
- Envoy proxy configuration (using built-in middleware)
- Automated performance benchmarking tests (manual validation only)
- User-level or gradual rollout feature flags (app-level only)
- Removal of REST endpoints after migration (both remain available)
- Advanced gRPC features: bidirectional streaming, deadlines, interceptors, custom metadata
- Load balancing or service mesh integration
- Production deployment configuration beyond Docker Compose
- Team training materials or documentation beyond code comments
- Migration of non-expense endpoints (if any exist)
- Database schema changes or EF migrations
