# Spec Requirements: REST to gRPC Migration

## Initial Description
Migrate the Cash Caddy expense tracker from HTTP REST communication to gRPC for frontend-backend communication to improve performance, type safety, and enable future streaming capabilities.

## Requirements Discussion

### First Round Questions

**Q1:** gRPC-Web Middleware Approach - I assume we'll use ASP.NET Core's built-in `Grpc.AspNetCore.Web` middleware rather than setting up an Envoy proxy, since it's simpler and the pre-plan mentions it as the primary option. Is that correct, or would you prefer the Envoy approach?
**Answer:** Yes, use ASP.NET Core's built-in middleware.

**Q2:** Feature Flag Implementation - I'm thinking we'll add a simple environment variable or configuration setting (like `USE_GRPC=true/false`) to toggle between REST and gRPC in the frontend. Should this be an app-level setting, or would you prefer user-level control for gradual rollout?
**Answer:** Use app level setting.

**Q3:** Migration Phases - The pre-plan outlines 4 phases. Should we implement all phases as one complete feature, or would you prefer to break this into separate specs (e.g., Phase 1-2 as "gRPC Implementation", Phase 3-4 as "Migration & Cleanup")?
**Answer:** Choose most manageable strategy - implement as single comprehensive feature with all phases.

**Q4:** Port Configuration - The plan specifies port 5001 for gRPC. Should the backend run both protocols on different ports (5000 for REST, 5001 for gRPC), or should we configure the same port to handle both protocols?
**Answer:** Different ports - REST on 5000, gRPC on 5001.

**Q5:** Protobuf Generation - For the TypeScript client generation, should we add build scripts to `package.json` that auto-generate TypeScript types from `.proto` files, or handle generation manually with documentation?
**Answer:** Choose simplest strategy - add build scripts to package.json for automatic generation.

**Q6:** Testing Scope - The pre-plan mentions comprehensive testing. Should we include performance benchmarking tests in the implementation, or is functional testing sufficient with manual performance validation?
**Answer:** Functional testing only, with manual performance validation.

**Q7:** REST Endpoint Deprecation - When we reach Phase 4, should we completely remove REST endpoints or keep them as a "deprecated but functional" fallback with warning logs?
**Answer:** No removal - with app level setting toggle we can keep both protocols available.

### Existing Code to Reference

**Similar Features Identified:**
No existing gRPC services, protobuf definitions, or feature flag implementations were found in the codebase.

**Current Implementation to Leverage:**
- Backend: `backend/src/CashCaddy/repositories/ExpenseRepository.cs` - existing repository layer to reuse
- Backend: `backend/src/CashCaddy/Program.cs` - minimal API endpoints to understand existing patterns
- Backend: `backend/src/CashCaddy/Models/Expense.cs` - entity model to map to protobuf
- Frontend: `frontend/cash-caddy-ui/src/services/api.ts` - existing Axios service to mirror with gRPC
- Frontend: `frontend/cash-caddy-ui/src/components/` - components that will consume the new gRPC service

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets available. Will reference existing architecture diagrams in `/docs/diagrams/` for context.

## Requirements Summary

### Functional Requirements

**Backend (.NET 9):**
- Add gRPC NuGet packages: `Grpc.AspNetCore`, `Grpc.AspNetCore.Web`, `Google.Protobuf`, `Grpc.Tools`
- Create protobuf schema file at `backend/src/CashCaddy/Protos/expense.proto` with service and message definitions
- Implement `ExpenseService` gRPC service with methods: GetExpenses, GetExpense, CreateExpense, UpdateExpense, DeleteExpense
- Configure gRPC in Program.cs with gRPC-Web middleware and CORS
- Run gRPC service on port 5001 (separate from REST on 5000)
- Reuse existing ExpenseRepository for data access
- Map between protobuf messages and Expense entity model

**Frontend (React + TypeScript):**
- Add gRPC-Web npm packages: `grpc-web`, `google-protobuf`
- Add protoc compiler and TypeScript plugin to dev dependencies
- Create build script in package.json to generate TypeScript client from .proto file
- Implement new gRPC service at `src/services/grpc-api.ts`
- Add app-level configuration/environment variable `VITE_USE_GRPC` to toggle protocols
- Create protocol abstraction layer that switches between REST and gRPC based on config
- Maintain existing component interfaces (no component changes needed)

**Testing:**
- Functional unit tests for gRPC service methods
- Integration tests to verify gRPC endpoints work correctly
- Browser compatibility testing (manual)
- No automated performance benchmarking - manual validation only

**Configuration:**
- Backend: Configure both REST (5000) and gRPC (5001) ports in appsettings.json
- Frontend: Environment variable `VITE_USE_GRPC=true/false` to control protocol selection
- Docker: Update docker-compose.yml to expose port 5001

### Reusability Opportunities
- ExpenseRepository interface and implementation (no changes needed)
- Existing entity model structure for protobuf message design
- CORS configuration patterns from REST setup
- Error handling patterns from existing minimal APIs
- Axios service structure as template for gRPC service wrapper

### Scope Boundaries

**In Scope:**
- Complete gRPC implementation with all CRUD operations
- Protocol buffer schema definition
- gRPC-Web client implementation
- Feature flag for protocol switching
- Both protocols running in parallel
- Functional testing
- Docker configuration updates
- Documentation updates

**Out of Scope:**
- Envoy proxy setup (using ASP.NET Core middleware instead)
- Automated performance benchmarking tests
- User-level or gradual rollout feature flags
- Removal of REST endpoints
- Advanced gRPC features (streaming, deadlines, interceptors)
- Load balancing or service mesh configuration
- Production deployment strategy
- Team training materials

### Technical Considerations

**Protocol Buffers Schema Design:**
- Map Expense entity fields to protobuf message
- Use appropriate protobuf types (string for ID/date, double for amount, string for description/category)
- Define request/response messages for each operation
- Keep schema simple and aligned with existing entity model

**gRPC-Web Configuration:**
- Use ASP.NET Core built-in `Grpc.AspNetCore.Web` middleware (no Envoy)
- Configure CORS to allow gRPC-Web requests from localhost:5173
- Enable HTTP/2 support in Kestrel configuration
- Ensure compatibility with browser environments

**Feature Flag Implementation:**
- Simple environment variable approach: `VITE_USE_GRPC=true/false`
- Read at application startup in frontend
- Create abstraction layer that delegates to REST or gRPC service
- Default to REST (false) for safety during development

**Build Process:**
- Add npm script to generate TypeScript from .proto: `"proto:generate"`
- Run during build or manually when .proto changes
- Store generated files in `src/generated/` (git-ignored)
- Document generation process in README

**Backward Compatibility:**
- Both REST and gRPC remain available indefinitely
- Components unaware of underlying protocol (abstraction layer handles switching)
- No breaking changes to existing functionality
- Feature flag allows instant rollback if issues occur
