# Application Workflows

This document illustrates the key workflows and processes in the Cash Caddy expense tracker application.

## User Workflow: Create Expense

```mermaid
flowchart TD
    Start([User Opens App]) --> LoadExp[Load Existing Expenses]
    LoadExp --> Display[Display Expense List]
    Display --> UserAction{User Action?}
    
    UserAction -->|Add New| FillForm[Fill Expense Form]
    UserAction -->|Edit| SelectExp[Select Expense]
    UserAction -->|Delete| ConfirmDel{Confirm Delete?}
    
    FillForm --> EnterDate[Enter Date]
    EnterDate --> EnterAmt[Enter Amount]
    EnterAmt --> EnterDesc[Enter Description]
    EnterDesc --> EnterCat[Select Category]
    EnterCat --> Submit[Submit Form]
    
    Submit --> Validate{Valid?}
    Validate -->|No| ShowError[Show Validation Error]
    ShowError --> FillForm
    Validate -->|Yes| SaveAPI[POST /expenses]
    
    SelectExp --> LoadData[Load Expense Data]
    LoadData --> EditForm[Populate Edit Form]
    EditForm --> UpdateSubmit[Submit Updates]
    UpdateSubmit --> UpdateAPI[PUT /expenses/:id]
    
    ConfirmDel -->|Yes| DeleteAPI[DELETE /expenses/:id]
    ConfirmDel -->|No| Display
    
    SaveAPI --> Success{Success?}
    UpdateAPI --> Success
    DeleteAPI --> Success
    
    Success -->|Yes| Refresh[Refresh List]
    Success -->|No| ShowError
    Refresh --> Display
    
    style Start fill:#90ee90
    style Success fill:#ffd700
    style ShowError fill:#ff6b6b
```

## API Request Flow

```mermaid
flowchart LR
    subgraph "Frontend"
        UI[React Component]
        API[API Service<br/>api.ts]
    end
    
    subgraph "Network"
        HTTP[HTTP Request<br/>Axios]
        CORS[CORS Check]
    end
    
    subgraph "Backend"
        Route[Minimal API Route]
        Repo[Repository]
        EF[Entity Framework]
        DB[(Database)]
    end
    
    UI -->|User Action| API
    API -->|axios.get/post/put/delete| HTTP
    HTTP --> CORS
    CORS -->|Allowed Origin| Route
    Route -->|Call Method| Repo
    Repo -->|Query/Command| EF
    EF -->|SQL| DB
    
    DB -.->|Data| EF
    EF -.->|Entity| Repo
    Repo -.->|DTO| Route
    Route -.->|JSON| CORS
    CORS -.->|Response| HTTP
    HTTP -.->|Promise| API
    API -.->|Update State| UI
    
    style UI fill:#61dafb
    style Route fill:#512bd4
    style DB fill:#336791
```

## CRUD Operations Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Loading: User Action
    Loading --> DisplayList: GET /expenses
    DisplayList --> Idle: View List
    
    DisplayList --> Creating: Click "Add"
    Creating --> Validating: Submit Form
    Validating --> Creating: Invalid Data
    Validating --> Saving: Valid Data
    Saving --> DisplayList: POST /expenses (201)
    Saving --> Error: POST Failed
    
    DisplayList --> Editing: Click "Edit"
    Editing --> Validating: Submit Changes
    Validating --> Updating: Valid Data
    Updating --> DisplayList: PUT /expenses/:id (200)
    Updating --> Error: PUT Failed
    
    DisplayList --> Confirming: Click "Delete"
    Confirming --> DisplayList: Cancel
    Confirming --> Deleting: Confirm
    Deleting --> DisplayList: DELETE /expenses/:id (204)
    Deleting --> Error: DELETE Failed
    
    Error --> Idle: Dismiss Error
    
    note right of Saving
        Creates new expense
        in database
    end note
    
    note right of Updating
        Updates existing
        expense by ID
    end note
    
    note right of Deleting
        Removes expense
        from database
    end note
```

## Application Startup Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Docker as Docker Compose
    participant PG as PostgreSQL
    participant API as .NET API
    participant FE as React App
    participant Browser as Browser
    
    Dev->>Docker: docker compose up
    
    Docker->>PG: Start PostgreSQL Container
    PG->>PG: Initialize Database
    
    Docker->>API: Start Backend Container
    API->>API: Load Configuration
    API->>API: Configure Services
    API->>PG: Test Connection
    API->>API: Apply EF Migrations
    API->>API: Seed Sample Data
    API->>API: Start Kestrel Server (Port 5000)
    
    Docker->>FE: Start Frontend Container
    FE->>FE: Install Dependencies
    FE->>FE: Start Vite Dev Server (Port 5173)
    
    Dev->>Browser: Open localhost:5173
    Browser->>FE: Request App
    FE->>Browser: Serve React App
    Browser->>Browser: Initialize React
    Browser->>API: GET /expenses
    API->>PG: Query Expenses
    PG-->>API: Return Data
    API-->>Browser: JSON Response
    Browser->>Browser: Render UI with Data
```

## Data Persistence Flow

```mermaid
flowchart TD
    Start([API Request Received]) --> Parse[Parse Request Body]
    Parse --> Map[Map to Entity Model]
    Map --> Repo[Repository Method Call]
    
    Repo --> Action{Action Type?}
    
    Action -->|Create| Add[DbContext.Add]
    Action -->|Update| Modify[DbContext.Update]
    Action -->|Delete| Remove[DbContext.Remove]
    Action -->|Read| Query[DbContext.Query]
    
    Add --> SaveChanges[SaveChangesAsync]
    Modify --> SaveChanges
    Remove --> SaveChanges
    Query --> Return[Return Results]
    
    SaveChanges --> EF[Entity Framework Core]
    EF --> GenSQL[Generate SQL]
    GenSQL --> Execute[Execute Against PostgreSQL]
    
    Execute --> Success{Success?}
    Success -->|Yes| Return
    Success -->|No| Rollback[Rollback Transaction]
    
    Rollback --> Error[Throw Exception]
    Return --> Response[Build HTTP Response]
    Response --> End([Return to Client])
    
    style Start fill:#90ee90
    style Success fill:#ffd700
    style Error fill:#ff6b6b
    style End fill:#90ee90
```

## Component Lifecycle Flow

```mermaid
sequenceDiagram
    participant User
    participant App as App.tsx
    participant Form as ExpenseForm
    participant List as Expenses
    participant API as api.ts
    participant Backend as .NET API
    
    User->>App: Load Application
    App->>App: Initialize State
    App->>List: Render Component
    List->>List: useEffect Hook
    List->>API: fetchExpenses()
    API->>Backend: GET /expenses
    Backend-->>API: JSON Array
    API-->>List: Expense[]
    List->>List: Update State
    List->>User: Display Expenses
    
    User->>Form: Fill Form & Submit
    Form->>Form: Validate Input
    Form->>API: createExpense(data)
    API->>Backend: POST /expenses
    Backend-->>API: 201 Created
    API-->>Form: Success
    Form->>App: Trigger Refresh
    App->>List: Re-render
    List->>API: fetchExpenses()
    API->>Backend: GET /expenses
    Backend-->>API: Updated Array
    API-->>List: Expense[]
    List->>User: Show New Expense
```

## Error Handling Flow

```mermaid
flowchart TD
    Request[API Request] --> Try{Try Execute}
    
    Try -->|Success| Process[Process Data]
    Try -->|Exception| Catch[Catch Exception]
    
    Process --> Return[Return 200/201]
    
    Catch --> Type{Error Type?}
    Type -->|Validation| Val400[Return 400 Bad Request]
    Type -->|Not Found| NF404[Return 404 Not Found]
    Type -->|Database| DB500[Return 500 Server Error]
    Type -->|Unknown| Gen500[Return 500 Generic Error]
    
    Val400 --> LogError[Log Error Details]
    NF404 --> LogError
    DB500 --> LogError
    Gen500 --> LogError
    
    LogError --> ClientError[Send Error to Client]
    ClientError --> FrontEnd[Frontend Catches Error]
    FrontEnd --> Display[Display User Message]
    Display --> Recover{Recoverable?}
    
    Recover -->|Yes| Retry[Allow Retry]
    Recover -->|No| ShowError[Show Error State]
    
    Return --> End([Success])
    ShowError --> End
    Retry --> Request
    
    style Request fill:#90ee90
    style Return fill:#90ee90
    style LogError fill:#ffd700
    style ClientError fill:#ff6b6b
```
