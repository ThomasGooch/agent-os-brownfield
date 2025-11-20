# gRPC Architecture and Data Flow

## Overview
This document visualizes the REST to gRPC migration architecture, showing dual protocol support and communication patterns.

## High-Level Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React + TypeScript)"]
        UI[User Interface]
        Factory[API Factory<br/>Feature Flag Router]
        REST_Client[REST Client<br/>Axios]
        GRPC_Client[gRPC-Web Client<br/>ExpenseServiceClient]
    end
    
    subgraph Backend["Backend (.NET 9)"]
        REST_API[Minimal APIs<br/>HTTP/1.1 Port 5000]
        GRPC_Service[gRPC Service<br/>HTTP/2 Port 5001]
        GRPC_Web[gRPC-Web Middleware]
        Repo[Repository Layer<br/>IExpenseRepository]
    end
    
    subgraph Data["Data Layer"]
        EF[Entity Framework Core]
        PG[(PostgreSQL)]
    end
    
    UI --> Factory
    Factory -->|VITE_USE_GRPC=false| REST_Client
    Factory -->|VITE_USE_GRPC=true| GRPC_Client
    
    REST_Client -->|JSON/HTTP| REST_API
    GRPC_Client -->|Protobuf/HTTP2| GRPC_Web
    GRPC_Web --> GRPC_Service
    
    REST_API --> Repo
    GRPC_Service --> Repo
    Repo --> EF
    EF --> PG
    
    style Factory fill:#ff9,stroke:#333,stroke-width:3px
    style Repo fill:#9f9,stroke:#333,stroke-width:3px
```

## Protocol Switching Flow

```mermaid
sequenceDiagram
    participant User
    participant Component as React Component
    participant Factory as API Factory
    participant Env as Environment Config
    participant REST as REST API
    participant gRPC as gRPC Service
    
    User->>Component: Interact (e.g., Get Expenses)
    Component->>Factory: Call getExpenses()
    Factory->>Env: Read VITE_USE_GRPC
    
    alt REST Mode (VITE_USE_GRPC=false)
        Factory->>REST: HTTP GET /expenses
        REST-->>Factory: JSON Response
    else gRPC Mode (VITE_USE_GRPC=true)
        Factory->>gRPC: GetExpenses RPC
        gRPC-->>Factory: Protobuf Response
    end
    
    Factory-->>Component: Typed Expense[]
    Component-->>User: Display Data
```

## REST Communication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Axios
    participant MinimalAPI as Minimal API<br/>(Port 5000)
    participant Repository
    participant EF as Entity Framework
    participant DB as PostgreSQL
    
    Browser->>Axios: api.getExpenses()
    Axios->>MinimalAPI: GET /expenses<br/>Content-Type: application/json
    MinimalAPI->>Repository: GetAllExpensesAsync()
    Repository->>EF: Query Expenses
    EF->>DB: SELECT * FROM Expenses
    DB-->>EF: Rows
    EF-->>Repository: List<Expense>
    Repository-->>MinimalAPI: List<Expense>
    MinimalAPI-->>Axios: JSON Array<br/>Status 200
    Axios-->>Browser: Expense[]
```

## gRPC Communication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant gRPCWeb as gRPC-Web Client
    participant Middleware as gRPC-Web Middleware
    participant gRPCService as ExpenseGrpcService<br/>(Port 5001)
    participant Repository
    participant EF as Entity Framework
    participant DB as PostgreSQL
    
    Browser->>gRPCWeb: grpcApi.getExpenses()
    gRPCWeb->>Middleware: POST /expense.ExpenseService/GetExpenses<br/>Content-Type: application/grpc-web+proto<br/>X-Grpc-Web: 1
    Middleware->>gRPCService: GetExpenses(Empty)
    gRPCService->>Repository: GetAllExpensesAsync()
    Repository->>EF: Query Expenses
    EF->>DB: SELECT * FROM Expenses
    DB-->>EF: Rows
    EF-->>Repository: List<Expense>
    Repository-->>gRPCService: List<Expense>
    gRPCService->>gRPCService: Map to ExpenseMessage[]
    gRPCService-->>Middleware: GetExpensesResponse<br/>(Protobuf)
    Middleware-->>gRPCWeb: gRPC-Web Response
    gRPCWeb-->>Browser: Expense[]
```

## Dual Protocol Comparison

```mermaid
graph LR
    subgraph REST["REST Communication"]
        R1[JSON Serialization]
        R2[HTTP/1.1]
        R3[Text-based]
        R4[Larger payload]
        R5[Widely supported]
    end
    
    subgraph gRPC["gRPC Communication"]
        G1[Protobuf Serialization]
        G2[HTTP/2]
        G3[Binary format]
        G4[Smaller payload]
        G5[Modern, efficient]
    end
    
    REST -->|Same| Backend[Shared Backend Logic<br/>IExpenseRepository]
    gRPC -->|Same| Backend
    
    style Backend fill:#9f9,stroke:#333,stroke-width:3px
```

## Port Configuration

```mermaid
graph TD
    subgraph Kestrel["Kestrel Web Server"]
        P5000[Port 5000<br/>HTTP/1.1<br/>REST Endpoints]
        P5001[Port 5001<br/>HTTP/2<br/>gRPC Service]
    end
    
    subgraph Frontend["Frontend Dev Server"]
        P5173[Port 5173<br/>React App]
    end
    
    subgraph Database["Database"]
        P5432[Port 5432<br/>PostgreSQL]
    end
    
    P5173 -->|REST| P5000
    P5173 -->|gRPC-Web| P5001
    P5000 --> P5432
    P5001 --> P5432
```

## Feature Flag Decision Tree

```mermaid
graph TD
    Start[Application Starts] --> ReadEnv[Read VITE_USE_GRPC<br/>from .env]
    ReadEnv --> CheckFlag{VITE_USE_GRPC?}
    
    CheckFlag -->|true| gRPCPath[Use gRPC-Web Client]
    CheckFlag -->|false or undefined| RESTPath[Use REST/Axios Client]
    
    gRPCPath --> gRPCImpl[grpc-api.ts<br/>ExpenseServiceClient<br/>Port 5001]
    RESTPath --> RESTImpl[api.ts<br/>Axios<br/>Port 5000]
    
    gRPCImpl --> Factory[API Factory exports<br/>selected implementation]
    RESTImpl --> Factory
    
    Factory --> Components[React Components<br/>import from api-factory]
    
    style CheckFlag fill:#ff9,stroke:#333,stroke-width:2px
    style Factory fill:#9f9,stroke:#333,stroke-width:2px
```

## Data Transformation Pipeline

### REST Pipeline
```mermaid
graph LR
    DB[(Database<br/>Row)] --> Entity[Expense Entity<br/>.NET Object]
    Entity --> JSON[JSON Serializer]
    JSON --> HTTP[HTTP Response]
    HTTP --> Parse[JSON.parse]
    Parse --> TS[TypeScript Object]
```

### gRPC Pipeline
```mermaid
graph LR
    DB[(Database<br/>Row)] --> Entity[Expense Entity<br/>.NET Object]
    Entity --> Map[MapToExpenseMessage]
    Map --> Proto[ExpenseMessage<br/>Protobuf]
    Proto --> Binary[Binary Encoding]
    Binary --> HTTP2[HTTP/2 Response]
    HTTP2 --> Decode[Protobuf Decode]
    Decode --> TS[TypeScript Object]
```

## Error Handling Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as REST or gRPC
    participant Service
    participant DB
    
    Client->>API: Request
    API->>Service: Process
    Service->>DB: Query
    
    alt Success
        DB-->>Service: Data
        Service-->>API: Success Response
        API-->>Client: 200 OK / RPC Success
    else Not Found
        DB-->>Service: Empty
        Service-->>API: Not Found
        alt REST
            API-->>Client: 404 Not Found
        else gRPC
            API-->>Client: RpcException<br/>StatusCode.NotFound
        end
    else Error
        DB-->>Service: Exception
        Service-->>API: Error
        alt REST
            API-->>Client: 500 Internal Error
        else gRPC
            API-->>Client: RpcException<br/>StatusCode.Internal
        end
    end
```

## Deployment Architecture

```mermaid
graph TB
    subgraph Docker["Docker Compose Environment"]
        subgraph Frontend_Container["Frontend Container"]
            React[React App<br/>Port 5173]
            Vite[Vite Dev Server]
        end
        
        subgraph Backend_Container["Backend Container"]
            REST[REST API<br/>Port 5000]
            gRPC[gRPC Service<br/>Port 5001]
            Kestrel[Kestrel Server]
        end
        
        subgraph DB_Container["Database Container"]
            PostgreSQL[(PostgreSQL 16<br/>Port 5432)]
            Volume[Persistent Volume]
        end
    end
    
    React --> Vite
    REST --> Kestrel
    gRPC --> Kestrel
    
    Vite -->|HTTP| REST
    Vite -->|HTTP/2| gRPC
    
    REST --> PostgreSQL
    gRPC --> PostgreSQL
    PostgreSQL --> Volume
    
    style Docker fill:#e6f3ff,stroke:#333,stroke-width:2px
```

## Key Design Decisions

### 1. Shared Repository Layer
Both REST and gRPC implementations use the same `IExpenseRepository` interface, ensuring:
- Single source of truth for business logic
- Consistent data access patterns
- Easy maintenance and testing

### 2. Protocol Abstraction
The `api-factory.ts` provides transparent protocol switching:
- Components remain protocol-agnostic
- No code changes required to switch protocols
- Runtime configuration via environment variable

### 3. Dual Port Configuration
Separate ports for each protocol:
- **Port 5000**: HTTP/1.1 for REST (widely compatible)
- **Port 5001**: HTTP/2 for gRPC (modern, efficient)

### 4. gRPC-Web Middleware
Enables browser-based gRPC communication:
- Translates gRPC-Web to native gRPC
- CORS configuration for cross-origin requests
- Header exposure for status codes

### 5. Type Safety
TypeScript interfaces ensure type consistency:
- Shared `Expense` interface across both protocols
- Compile-time type checking
- IDE autocomplete support
