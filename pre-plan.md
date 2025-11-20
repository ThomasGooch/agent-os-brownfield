# Pre-Plan: Migration from REST to gRPC

**Status:** Planning Phase  
**Date:** November 20, 2025  
**Priority:** High  
**Effort Estimate:** L (2 weeks)

## 🎯 Overview

This document outlines our plan to migrate the Cash Caddy expense tracker from HTTP REST communication to gRPC for frontend-backend communication. This migration will improve performance, type safety, and enable bidirectional streaming capabilities for future features.

## 📊 Current State

### Existing Architecture

```
React Frontend (Port 5173)
    ↓ HTTP/REST (Axios)
    ↓ JSON Payloads
.NET 9 API (Port 5000)
    ↓ Minimal APIs
    ↓ Entity Framework Core
PostgreSQL Database
```

### Current Implementation Details

- **Protocol:** HTTP/REST with JSON
- **Frontend Communication:** Axios-based API service (`src/services/api.ts`)
- **Backend Endpoints:** Minimal API endpoints in `Program.cs`
- **Data Format:** JSON serialization/deserialization
- **CORS:** Configured for localhost:5173

### Current API Endpoints

```
GET    /expenses          → List all expenses
GET    /expenses/{id}     → Get single expense
POST   /expenses          → Create new expense
PUT    /expenses/{id}     → Update expense
DELETE /expenses/{id}     → Delete expense
```

## 🚀 Target State

### Proposed Architecture

```
React Frontend (Port 5173)
    ↓ gRPC-Web
    ↓ Protocol Buffers
.NET 9 gRPC Service (Port 5001)
    ↓ gRPC Server
    ↓ Entity Framework Core
PostgreSQL Database
```

### Target Implementation Details

- **Protocol:** gRPC with Protocol Buffers (protobuf)
- **Frontend Communication:** gRPC-Web client
- **Backend Service:** ASP.NET Core gRPC service
- **Data Format:** Binary protocol buffers (efficient, strongly-typed)
- **Proxy:** Envoy proxy for gRPC-Web support (or ASP.NET Core gRPC-Web middleware)

## 🔄 Migration Strategy

### Phase 1: Foundation Setup (3-4 days)

**Backend:**
1. Add gRPC NuGet packages to `CashCaddy.API.csproj`
   - `Grpc.AspNetCore`
   - `Grpc.AspNetCore.Web` (for gRPC-Web support)
   - `Google.Protobuf`
   - `Grpc.Tools` (for protobuf compilation)

2. Create `.proto` file defining service contracts
   - Define `ExpenseService` with RPC methods
   - Define message types (ExpenseMessage, CreateExpenseRequest, etc.)
   - Place in `backend/src/CashCaddy/Protos/expense.proto`

3. Configure gRPC services in `Program.cs`
   - Add gRPC services to DI container
   - Configure gRPC-Web middleware
   - Enable CORS for gRPC-Web

4. Implement `ExpenseService` gRPC service
   - Implement RPCs: `GetExpenses`, `GetExpense`, `CreateExpense`, `UpdateExpense`, `DeleteExpense`
   - Reuse existing repository layer
   - Map between protobuf messages and domain entities

**Frontend:**
5. Add gRPC-Web packages
   - `@grpc/grpc-js`
   - `@grpc/proto-loader` or `grpc-web`
   - `google-protobuf`

6. Generate TypeScript client from `.proto` file
   - Use `protoc` compiler with TypeScript plugin
   - Generate client stubs and message types

**Deliverables:**
- ✅ gRPC service running alongside REST endpoints
- ✅ Protocol buffer definitions
- ✅ TypeScript client generated
- ✅ Basic connectivity verified

### Phase 2: Parallel Implementation (4-5 days)

**Backend:**
1. Run gRPC service on separate port (5001) initially
2. Keep existing REST endpoints functional
3. Test gRPC service with tools like `grpcurl` or `BloomRPC`

**Frontend:**
1. Create new gRPC-based API service (`src/services/grpc-api.ts`)
2. Implement gRPC client initialization
3. Create wrapper methods matching existing API interface
4. Add feature flag to toggle between REST and gRPC

**Testing:**
1. Unit tests for gRPC service methods
2. Integration tests comparing REST vs gRPC responses
3. Browser testing of gRPC-Web client
4. Performance benchmarking (latency, payload size)

**Deliverables:**
- ✅ Both REST and gRPC working in parallel
- ✅ Feature flag for switching protocols
- ✅ Comprehensive test coverage
- ✅ Performance metrics documented

### Phase 3: Migration & Validation (3-4 days)

**Gradual Rollout:**
1. Enable gRPC for read operations first (`GetExpenses`, `GetExpense`)
2. Monitor for issues and performance
3. Enable gRPC for write operations (`Create`, `Update`, `Delete`)
4. Validate data consistency between protocols

**Validation:**
1. Load testing with realistic traffic patterns
2. Error handling and retry logic verification
3. Network resilience testing
4. Browser compatibility testing (Chrome, Firefox, Safari, Edge)

**Deliverables:**
- ✅ All operations running via gRPC
- ✅ REST endpoints still available as fallback
- ✅ Monitoring and logging in place
- ✅ Documentation updated

### Phase 4: Cleanup & Optimization (2-3 days)

**Cleanup:**
1. Remove REST endpoints from `Program.cs` (or mark as deprecated)
2. Remove Axios-based API service from frontend
3. Remove REST-specific middleware (if any)
4. Update Docker configuration if needed

**Optimization:**
1. Fine-tune message sizes and compression
2. Implement connection pooling
3. Add request/response caching where appropriate
4. Optimize protobuf message definitions

**Documentation:**
1. Update `CLAUDE.md` with gRPC details
2. Update `.github/copilot-instructions.md`
3. Create architecture diagrams showing gRPC flow
4. Document debugging and troubleshooting steps

**Deliverables:**
- ✅ REST endpoints removed
- ✅ Codebase cleaned and optimized
- ✅ Complete documentation
- ✅ Team training materials ready

## 📋 Technical Considerations

### Protocol Buffers Schema Design

```protobuf
syntax = "proto3";

package expense;

service ExpenseService {
  rpc GetExpenses (GetExpensesRequest) returns (GetExpensesResponse);
  rpc GetExpense (GetExpenseRequest) returns (ExpenseResponse);
  rpc CreateExpense (CreateExpenseRequest) returns (ExpenseResponse);
  rpc UpdateExpense (UpdateExpenseRequest) returns (ExpenseResponse);
  rpc DeleteExpense (DeleteExpenseRequest) returns (DeleteExpenseResponse);
}

message Expense {
  string id = 1;
  string date = 2;
  double amount = 3;
  string description = 4;
  string category = 5;
}

message GetExpensesRequest {
  // Future: Add filtering, pagination
}

message GetExpensesResponse {
  repeated Expense expenses = 1;
}

// Additional message definitions...
```

### gRPC-Web Browser Support

- **Challenge:** Browsers don't natively support HTTP/2 gRPC
- **Solution:** Use gRPC-Web with ASP.NET Core middleware
- **Alternative:** Envoy proxy (more complex, production-grade)

### Backward Compatibility

- Maintain REST endpoints during migration
- Use feature flags to control rollout
- Provide fallback mechanism in frontend
- Document migration timeline for stakeholders

### Performance Expectations

**Expected Improvements:**
- 20-40% reduction in payload size (binary vs JSON)
- 10-30% reduction in latency (HTTP/2 multiplexing)
- Better type safety (compile-time checking)
- Native streaming support for future features

**Trade-offs:**
- Slightly more complex debugging (binary protocol)
- Additional build step (protobuf compilation)
- Learning curve for team members
- Browser compatibility considerations

## 🧪 Testing Strategy

### Unit Tests
- Test each gRPC service method
- Test protobuf message serialization/deserialization
- Mock repository layer for isolation

### Integration Tests
- Test full request/response cycle
- Compare REST vs gRPC responses for consistency
- Test error scenarios (not found, validation errors, etc.)

### Performance Tests
- Benchmark REST vs gRPC latency
- Measure payload sizes
- Test under load (concurrent requests)
- Monitor resource usage (CPU, memory, network)

### Browser Tests
- Test in major browsers (Chrome, Firefox, Safari, Edge)
- Test on different networks (fast, slow, flaky)
- Test error handling and retries
- Test connection lifecycle

## 🚧 Risks & Mitigation

### Risk 1: Browser Compatibility Issues
**Mitigation:** Extensive browser testing in Phase 3, maintain REST fallback

### Risk 2: Debugging Complexity
**Mitigation:** Implement comprehensive logging, use gRPC debugging tools, document troubleshooting

### Risk 3: Team Learning Curve
**Mitigation:** Provide training materials, pair programming sessions, documentation

### Risk 4: Performance Not Meeting Expectations
**Mitigation:** Benchmark early in Phase 2, maintain REST as fallback option

### Risk 5: Breaking Changes During Migration
**Mitigation:** Run in parallel, extensive testing, gradual rollout with feature flags

## 📦 Dependencies & Prerequisites

### Backend
- .NET 9 SDK (already installed)
- Protocol Buffer compiler (`protoc`)
- gRPC tools for .NET

### Frontend
- Node.js (already installed)
- Protocol Buffer compiler (`protoc`)
- gRPC-Web TypeScript plugin
- Compatible build configuration (Vite)

### Infrastructure
- Docker Compose update (if adding Envoy)
- Environment variable configuration
- Port allocation (5001 for gRPC)

## 📅 Timeline

```
Week 1:
├── Day 1-2: Phase 1 - Backend foundation
├── Day 3-4: Phase 1 - Frontend setup
└── Day 5:   Phase 1 - Integration & testing

Week 2:
├── Day 1-2: Phase 2 - Parallel implementation
├── Day 3:   Phase 3 - Migration & validation
└── Day 4-5: Phase 4 - Cleanup & optimization
```

## ✅ Success Criteria

1. **Functionality:** All CRUD operations work via gRPC
2. **Performance:** Measurable improvement in latency and payload size
3. **Reliability:** Error rates remain same or decrease
4. **Compatibility:** Works in all major browsers
5. **Code Quality:** Maintains or improves test coverage
6. **Documentation:** Complete and up-to-date
7. **Team Readiness:** Team comfortable with gRPC workflow

## 🔗 References

- [ASP.NET Core gRPC Documentation](https://learn.microsoft.com/en-us/aspnet/core/grpc/)
- [gRPC-Web Documentation](https://github.com/grpc/grpc-web)
- [Protocol Buffers Guide](https://protobuf.dev/)
- [gRPC Best Practices](https://grpc.io/docs/guides/performance/)

## 📝 Next Steps

1. **Review & Approval:** Get team sign-off on this plan
2. **Create Spec:** Run `/shape-spec` to formalize requirements
3. **Break Down Tasks:** Run `/create-tasks` to create detailed task list
4. **Begin Implementation:** Start Phase 1 with backend setup

---

**Note:** This is a pre-planning document. Before implementation, this should be converted to a formal spec using the agent-os workflow (`/shape-spec` → `/write-spec` → `/create-tasks` → `/implement-tasks`).
