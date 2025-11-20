# Agent-OS Development Flow

This document illustrates the agent-os workflow system for planning and implementing features.

## Complete Feature Development Workflow

```mermaid
flowchart TD
    Start([New Feature Idea]) --> HasProduct{Product<br/>Documented?}
    
    HasProduct -->|No| PlanProduct[/plan-product]
    HasProduct -->|Yes| ShapeSpec[/shape-spec]
    
    PlanProduct --> Mission[Create mission.md]
    Mission --> Roadmap[Create roadmap.md]
    Roadmap --> TechStack[Create tech-stack.md]
    TechStack --> ShapeSpec
    
    ShapeSpec --> Initialize[Initialize Spec Folder]
    Initialize --> Questions[Ask Clarifying Questions]
    Questions --> VisualCheck{Visual Assets<br/>Provided?}
    VisualCheck -->|Yes| AnalyzeVisuals[Analyze Mockups/Wireframes]
    VisualCheck -->|No| CodeReuse
    AnalyzeVisuals --> CodeReuse{Similar Code<br/>Exists?}
    CodeReuse -->|Yes| DocumentReuse[Document Reuse Opportunities]
    CodeReuse -->|No| SaveRequirements
    DocumentReuse --> SaveRequirements[Save requirements.md]
    
    SaveRequirements --> WriteSpec[/write-spec]
    WriteSpec --> SearchCode[Search for Reusable Code]
    SearchCode --> CreateSpec[Create spec.md]
    CreateSpec --> SpecReview{Spec<br/>Approved?}
    
    SpecReview -->|No| ShapeSpec
    SpecReview -->|Yes| CreateTasks[/create-tasks]
    
    CreateTasks --> BreakDown[Break into Task Groups]
    BreakDown --> Dependencies[Identify Dependencies]
    Dependencies --> Estimates[Add Effort Estimates]
    Estimates --> SaveTasks[Save tasks.md]
    
    SaveTasks --> ImplChoice{Implementation<br/>Approach?}
    
    ImplChoice -->|Simple| ImplementTasks[/implement-tasks]
    ImplChoice -->|Advanced| OrchestrateTasks[/orchestrate-tasks]
    
    OrchestrateTasks --> CreateOrch[Create orchestration.yml]
    CreateOrch --> AssignStandards[Assign Standards per Task]
    AssignStandards --> GenPrompts[Generate Prompt Files]
    GenPrompts --> ExecutePrompts[Execute Task Prompts]
    
    ImplementTasks --> DetermineTask[Determine Task Group]
    ExecutePrompts --> Implement
    DetermineTask --> Implement[Implement Task Group]
    
    Implement --> FollowPatterns[Follow Existing Patterns]
    FollowPatterns --> WriteTests[Write 2-8 Focused Tests]
    WriteTests --> WriteCode[Implement Code]
    WriteCode --> RunTests[Run Task Tests]
    RunTests --> UITask{UI Task?}
    
    UITask -->|Yes| BrowserTest[Test in Browser]
    UITask -->|No| UpdateTasks
    BrowserTest --> Screenshot[Save Screenshots]
    Screenshot --> UpdateTasks[Mark Tasks Complete]
    
    UpdateTasks --> MoreTasks{More Tasks?}
    MoreTasks -->|Yes| DetermineTask
    MoreTasks -->|No| Verify[/verify-implementation]
    
    Verify --> CheckComplete[Verify All Tasks Complete]
    CheckComplete --> UpdateRoadmap[Update roadmap.md]
    UpdateRoadmap --> RunAllTests[Run Full Test Suite]
    RunAllTests --> CreateReport[Create Verification Report]
    CreateReport --> End([Feature Complete])
    
    style Start fill:#90ee90
    style PlanProduct fill:#61dafb
    style ShapeSpec fill:#61dafb
    style WriteSpec fill:#61dafb
    style CreateTasks fill:#61dafb
    style ImplementTasks fill:#ffd700
    style OrchestrateTasks fill:#ffd700
    style End fill:#90ee90
```

## Agent-OS Command Structure

```mermaid
graph TB
    subgraph "Planning Commands"
        PP[/plan-product]
        PP1[1-product-concept.md]
        PP2[2-create-mission.md]
        PP3[3-create-roadmap.md]
        PP4[4-create-tech-stack.md]
        PP --> PP1 --> PP2 --> PP3 --> PP4
    end
    
    subgraph "Specification Commands"
        SS[/shape-spec]
        SS1[1-initialize-spec.md]
        SS2[2-shape-spec.md]
        SS --> SS1 --> SS2
        
        WS[/write-spec]
        WS1[write-spec.md]
        WS --> WS1
    end
    
    subgraph "Implementation Commands"
        CT[/create-tasks]
        CT1[1-get-spec-requirements.md]
        CT2[2-create-tasks-list.md]
        CT --> CT1 --> CT2
        
        IT[/implement-tasks]
        IT1[1-determine-tasks.md]
        IT2[2-implement-tasks.md]
        IT3[3-verify-implementation.md]
        IT --> IT1 --> IT2 --> IT3
        
        OT[/orchestrate-tasks]
        OT1[orchestrate-tasks.md]
        OT --> OT1
    end
    
    PP4 -.->|Next| SS
    SS2 -.->|Next| WS
    WS1 -.->|Next| CT
    CT2 -.->|Next| IT
    CT2 -.->|Or| OT
    
    style PP fill:#61dafb
    style SS fill:#61dafb
    style WS fill:#61dafb
    style CT fill:#90ee90
    style IT fill:#ffd700
    style OT fill:#ffd700
```

## Spec Folder Structure Evolution

```mermaid
flowchart LR
    subgraph "After /shape-spec"
        S1[agent-os/specs/<br/>YYYY-MM-DD-feature/]
        S1P[planning/]
        S1I[planning/initialization.md]
        S1R[planning/requirements.md]
        S1V[planning/visuals/]
        
        S1 --> S1P
        S1P --> S1I
        S1P --> S1R
        S1P --> S1V
    end
    
    subgraph "After /write-spec"
        S2[agent-os/specs/<br/>YYYY-MM-DD-feature/]
        S2S[spec.md]
        S2P[planning/...]
        
        S2 --> S2S
        S2 --> S2P
    end
    
    subgraph "After /create-tasks"
        S3[agent-os/specs/<br/>YYYY-MM-DD-feature/]
        S3T[tasks.md]
        S3S[spec.md]
        S3P[planning/...]
        
        S3 --> S3T
        S3 --> S3S
        S3 --> S3P
    end
    
    subgraph "After /implement-tasks"
        S4[agent-os/specs/<br/>YYYY-MM-DD-feature/]
        S4V[verification/]
        S4SS[verification/screenshots/]
        S4F[verification/final-verification.html]
        S4T[tasks.md ✓]
        S4Spec[spec.md]
        S4P[planning/...]
        
        S4 --> S4V
        S4V --> S4SS
        S4V --> S4F
        S4 --> S4T
        S4 --> S4Spec
        S4 --> S4P
    end
    
    S1 -.->|/write-spec| S2
    S2 -.->|/create-tasks| S3
    S3 -.->|/implement-tasks| S4
    
    style S1 fill:#61dafb
    style S2 fill:#61dafb
    style S3 fill:#90ee90
    style S4 fill:#ffd700
```

## Testing Strategy Flow

```mermaid
flowchart TD
    Start([Start Task Group]) --> TDD[Test-Driven Development]
    
    TDD --> Red[RED: Write Failing Test]
    Red --> HowMany{How Many<br/>Tests?}
    HowMany -->|"< 2"| MoreTests[Write More Tests]
    HowMany -->|2-8| Enough[Sufficient Coverage]
    HowMany -->|"> 8"| TooMany[Too Many - Refocus]
    
    MoreTests --> Red
    TooMany --> Refocus[Focus on Critical Behaviors Only]
    Refocus --> Red
    
    Enough --> Green[GREEN: Write Minimal Code]
    Green --> RunTests[Run Tests]
    RunTests --> Pass{Tests Pass?}
    
    Pass -->|No| Debug[Debug & Fix]
    Debug --> Green
    Pass -->|Yes| Refactor[REFACTOR: Improve Code]
    
    Refactor --> RunAgain[Run Tests Again]
    RunAgain --> StillPass{Still Pass?}
    StillPass -->|No| Refactor
    StillPass -->|Yes| Complete[Task Group Complete]
    
    Complete --> NextGroup{More Task<br/>Groups?}
    NextGroup -->|Yes| Start
    NextGroup -->|No| FinalTest[Test Gap Analysis]
    
    FinalTest --> GapCount{Critical<br/>Gaps?}
    GapCount -->|Yes| AddTests[Add Max 10 Tests]
    GapCount -->|No| AllDone
    AddTests --> AllDone[Run Full Suite]
    AllDone --> Report[Expected: 16-34 Tests Total]
    
    style Start fill:#90ee90
    style Red fill:#ff6b6b
    style Green fill:#90ee90
    style Refactor fill:#61dafb
    style Report fill:#ffd700
```

## Standards Application Flow

```mermaid
flowchart TD
    Start([Begin Implementation]) --> LoadSpec[Load spec.md & requirements.md]
    LoadSpec --> CheckOrch{Using<br/>/orchestrate-tasks?}
    
    CheckOrch -->|Yes| LoadOrch[Load orchestration.yml]
    CheckOrch -->|No| DefaultStandards[Apply All Standards]
    
    LoadOrch --> TaskGroup[Current Task Group]
    TaskGroup --> FindStandards[Find Standards for Task]
    FindStandards --> ParseRules{Parse Rules}
    
    ParseRules -->|"all"| AllFiles[Load All Standard Files]
    ParseRules -->|"global/*"| GlobalFiles[Load All Global Files]
    ParseRules -->|"backend/api.md"| SpecificFile[Load Specific File]
    ParseRules -->|"none"| NoStandards[No Standards Applied]
    
    AllFiles --> Compile[Compile Standards List]
    GlobalFiles --> Compile
    SpecificFile --> Compile
    DefaultStandards --> Compile
    
    Compile --> Dedupe[Remove Duplicates]
    Dedupe --> Apply[Apply to Implementation]
    NoStandards --> Apply
    
    Apply --> Implement[Implement Code]
    Implement --> Verify[Verify Compliance]
    Verify --> Pass{Compliant?}
    
    Pass -->|No| Review[Review Standards]
    Review --> Implement
    Pass -->|Yes| Done([Task Complete])
    
    style Start fill:#90ee90
    style LoadOrch fill:#61dafb
    style Apply fill:#ffd700
    style Done fill:#90ee90
```

## Visual Asset Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant SS as /shape-spec
    participant FS as File System
    participant AI as AI Analysis
    participant RD as requirements.md
    
    SS->>U: Ask Clarifying Questions
    U->>SS: Provide Answers
    
    Note over SS: MANDATORY CHECK
    SS->>FS: ls -la [spec]/planning/visuals/
    
    alt Visual Files Found
        FS-->>SS: mockup.png, wireframe.jpg
        SS->>AI: Analyze mockup.png
        AI-->>SS: High-fidelity design details
        SS->>AI: Analyze wireframe.jpg
        AI-->>SS: Low-fidelity layout structure
        
        SS->>SS: Check filename for "lofi"
        SS->>U: Confirm: Treat as layout guide?
        U->>SS: Yes, use existing styles
        
        SS->>RD: Document visual insights
        SS->>RD: Document fidelity levels
        SS->>RD: Document design patterns found
    else No Files Found
        FS-->>SS: No files
        SS->>RD: Document: No visual assets
    end
    
    SS->>U: Ask about similar features
    U->>SS: Path to existing component
    SS->>RD: Document reuse opportunity
```

## Orchestration vs Simple Implementation

```mermaid
graph TB
    Start([Tasks Ready]) --> Choice{Choose<br/>Approach}
    
    Choice -->|Simple| Simple[/implement-tasks]
    Choice -->|Advanced| Advanced[/orchestrate-tasks]
    
    subgraph "Simple Path"
        Simple --> S1[Determine Task Group]
        S1 --> S2[Load All Standards]
        S2 --> S3[Implement]
        S3 --> S4[Mark Complete]
        S4 --> S5{More?}
        S5 -->|Yes| S1
        S5 -->|No| SV[Verify All]
    end
    
    subgraph "Advanced Path"
        Advanced --> A1[Create orchestration.yml]
        A1 --> A2[List All Task Groups]
        A2 --> A3[Ask User: Standards per Task]
        A3 --> A4[Generate Prompt Files]
        A4 --> A5[Each Prompt Has Custom Standards]
        A5 --> A6[Execute Prompts in Order]
        A6 --> A7{More?}
        A7 -->|Yes| A6
        A7 -->|No| AV[Verify All]
    end
    
    SV --> End([Complete])
    AV --> End
    
    style Simple fill:#90ee90
    style Advanced fill:#ffd700
    style End fill:#90ee90
```
