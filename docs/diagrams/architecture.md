# System Architecture

This document provides an overview of the Cash Caddy expense tracker system architecture.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        ReactApp[React Application<br/>TypeScript + Vite]
    end
    
    subgraph "API Layer"
        API[.NET 9 Web API<br/>Minimal APIs]
        Middleware[CORS Middleware]
    end
    
    subgraph "Business Layer"
        Repo[Repository Pattern<br/>IExpenseRepository]
        Service[Entity Framework Core]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        Migrations[EF Migrations]
    end
    
    Browser --> ReactApp
    ReactApp -->|HTTP/REST| Middleware
    Middleware --> API
    API --> Repo
    Repo --> Service
    Service --> DB
    Migrations -.->|Schema Updates| DB
    
    style ReactApp fill:#61dafb
    style API fill:#512bd4
    style DB fill:#336791
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        App[App.tsx]
        ExpenseForm[ExpenseForm Component]
        ExpenseList[Expenses Component]
        APIService[API Service Layer]
    end
    
    subgraph "Backend Components"
        Program[Program.cs<br/>Startup & Routes]
        ExpRepo[ExpenseRepository]
        DbContext[ExpenseDbContext]
        Model[Expense Model]
    end
    
    App --> ExpenseForm
    App --> ExpenseList
    ExpenseForm --> APIService
    ExpenseList --> APIService
    
    APIService -->|HTTP Requests| Program
    Program --> ExpRepo
    ExpRepo --> DbContext
    DbContext --> Model
    
    style App fill:#61dafb
    style APIService fill:#ffd700
    style Program fill:#512bd4
    style DbContext fill:#90ee90
```

## Technology Stack

```mermaid
graph TD
    subgraph "Frontend Stack"
        React[React 19]
        TS[TypeScript]
        Vite[Vite Build Tool]
        Axios[Axios HTTP Client]
    end
    
    subgraph "Backend Stack"
        NET[.NET 9]
        MinAPI[Minimal APIs]
        EF[Entity Framework Core]
    end
    
    subgraph "Infrastructure"
        Docker[Docker Compose]
        PG[PostgreSQL 15]
    end
    
    React --> TS
    TS --> Vite
    Vite --> Axios
    
    NET --> MinAPI
    MinAPI --> EF
    
    Docker --> PG
    Docker --> NET
    Docker --> React
    
    style React fill:#61dafb
    style NET fill:#512bd4
    style Docker fill:#2496ed
    style PG fill:#336791
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant R as React UI
    participant A as API Service
    participant B as .NET API
    participant Repo as Repository
    participant DB as PostgreSQL
    
    U->>R: Interacts with UI
    R->>A: API Call (axios)
    A->>B: HTTP Request
    B->>Repo: Business Logic
    Repo->>DB: Query/Command
    DB-->>Repo: Data
    Repo-->>B: Entity
    B-->>A: JSON Response
    A-->>R: Data
    R-->>U: Updated UI
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Frontend Container"
            FE[React Dev Server<br/>Port 5173]
        end
        
        subgraph "Backend Container"
            BE[.NET API<br/>Port 5000]
        end
        
        subgraph "Database Container"
            DB[(PostgreSQL<br/>Port 5432)]
        end
    end
    
    Dev[Developer]
    Browser[Browser]
    
    Dev -->|docker compose up| FE
    Dev -->|docker compose up| BE
    Dev -->|docker compose up| DB
    
    Browser -->|localhost:5173| FE
    FE -->|API Calls<br/>localhost:5000| BE
    BE -->|Connection| DB
    
    style FE fill:#61dafb
    style BE fill:#512bd4
    style DB fill:#336791
```

## Directory Structure

```mermaid
graph TD
    Root[/]
    
    Root --> Frontend[frontend/cash-caddy-ui/]
    Root --> Backend[backend/]
    Root --> Docker[docker-compose.yml]
    Root --> AgentOS[agent-os/]
    
    Frontend --> FESrc[src/]
    FESrc --> Components[components/]
    FESrc --> Services[services/]
    
    Backend --> BESrc[src/CashCaddy/]
    Backend --> Tests[tests/]
    
    BESrc --> Models[Models/]
    BESrc --> Repos[repositories/]
    BESrc --> Data[Data/]
    BESrc --> Migrations[Migrations/]
    
    AgentOS --> Commands[commands/]
    AgentOS --> Standards[standards/]
    AgentOS --> Specs[specs/]
    
    style Frontend fill:#61dafb
    style Backend fill:#512bd4
    style AgentOS fill:#ffd700
```
