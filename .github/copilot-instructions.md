# GitHub Copilot Instructions for Agent-OS

This repository uses **agent-os** - a structured workflow system for planning, specifying, and implementing product features through AI-assisted development.

## Project Context

- **Frontend**: React 19 + TypeScript + Vite (port 5173) with REST + gRPC-Web support
- **Backend**: .NET 9 Web API with minimal APIs (port 5000) + gRPC services (port 5001) + Entity Framework Core
- **Database**: PostgreSQL 16 with EF migrations
- **Container**: Docker Compose multi-service setup
- **Communication**: Dual protocol support - REST (HTTP/1.1 JSON) and gRPC (HTTP/2 Protobuf)
- **Feature Flag**: VITE_USE_GRPC environment variable for runtime protocol switching (default: false)

## Agent-OS Command System

The `/agent-os/commands/` directory contains multi-phase workflows for feature development. Each command follows a structured process with numbered instruction files executed in sequence.

### Available Commands

#### 1. `/plan-product` - Product Planning
**Purpose**: Create mission, roadmap, and tech stack documentation

**Phases**:
1. **Product Concept**: Gather product vision, user personas, key features, and tech stack requirements
2. **Create Mission**: Generate `agent-os/product/mission.md` with product definition, users, problems, differentiators, and features
3. **Create Roadmap**: Generate `agent-os/product/roadmap.md` with ordered feature checklist and effort estimates (XS to XL)
4. **Create Tech Stack**: Document all tech stack choices in `agent-os/product/tech-stack.md`

**Output Files**:
- `agent-os/product/mission.md`
- `agent-os/product/roadmap.md`
- `agent-os/product/tech-stack.md`

#### 2. `/shape-spec` - Interactive Spec Shaping
**Purpose**: Research and document feature requirements through Q&A

**Phases**:
1. **Initialize Spec**: Create dated folder structure (`YYYY-MM-DD-spec-name/planning/`, `/visuals/`, `/implementation/`)
2. **Shape Spec**: 
   - Generate 4-8 clarifying questions with sensible defaults
   - **MANDATORY**: Always check for visual assets with bash command
   - Analyze mockups/wireframes (detect low-fidelity vs high-fidelity)
   - Ask about existing code reuse opportunities
   - Document all findings in `planning/requirements.md`

**Output Files**:
- `agent-os/specs/[dated-spec]/planning/initialization.md`
- `agent-os/specs/[dated-spec]/planning/requirements.md`
- `agent-os/specs/[dated-spec]/planning/visuals/` (optional user-provided files)

**Critical Requirements**:
- Always run: `ls -la [spec-path]/planning/visuals/ 2>/dev/null | grep -E '\.(png|jpg|jpeg|gif|svg|pdf)$'`
- Check for low-fi indicators in filenames: "lofi", "lo-fi", "wireframe", "sketch", "rough"
- Document similar existing features for reuse

#### 3. `/write-spec` - Spec Document Creation
**Purpose**: Create formal specification document from requirements

**Process**:
1. Analyze requirements and visual assets
2. **Search codebase for reusable patterns** (components, models, services, API patterns)
3. Create `spec.md` with structure:
   - Goal (1-2 sentences)
   - User Stories (up to 3)
   - Specific Requirements (up to 10, max 8 bullets each)
   - Visual Design (analyze each visual file with up to 8 bullets)
   - Existing Code to Leverage (up to 5 areas)
   - Out of Scope (up to 10 items)

**Output File**: `agent-os/specs/[dated-spec]/spec.md`

**Important Constraints**:
- Do NOT write actual code in spec.md
- Keep sections concise and skimmable
- Always search for reusable code first
- Follow template structure exactly

#### 4. `/create-tasks` - Task Breakdown
**Purpose**: Break spec into grouped, ordered implementation tasks

**Phases**:
1. **Get Spec Requirements**: Ensure spec.md and/or requirements.md exist
2. **Create Tasks List**: Generate `tasks.md` with strategic grouping

**Task Structure**:
- Group by specialization (Database Layer, API Layer, Frontend Components, Testing)
- Include dependencies between groups
- Each group has acceptance criteria
- Effort estimates (XS: 1 day, S: 2-3 days, M: 1 week, L: 2 weeks, XL: 3+ weeks)

**Testing Approach**:
- Each task group writes 2-8 focused tests maximum
- Test only critical behaviors during development
- Final Test Group adds max 10 additional tests for critical gaps
- Run only feature-specific tests (16-34 tests total expected)
- Do NOT run entire application test suite during development

**Output File**: `agent-os/specs/[dated-spec]/tasks.md`

#### 5. `/implement-tasks` - Simple Implementation
**Purpose**: Direct implementation of task groups

**Phases**:
1. **Determine Tasks**: Confirm which task groups to implement
2. **Implement Tasks**: 
   - Analyze spec, requirements, and visuals
   - Find and follow existing codebase patterns
   - Implement assigned task group only
   - Update tasks.md checkboxes to `- [x]`
   - Run tests written for this task group
   - If UI task: test in browser and save screenshots to `verification/screenshots/`
3. **Verify Implementation**: Final verification after all tasks complete

**Verification Process**:
- Ensure all tasks marked complete in tasks.md
- Update roadmap.md if applicable
- Run entire test suite and document results
- Create `verifications/final-verification.html` with status report

**Output Files**:
- Updated `agent-os/specs/[dated-spec]/tasks.md`
- `agent-os/specs/[dated-spec]/verification/screenshots/` (if UI work)
- `agent-os/specs/[dated-spec]/verifications/final-verification.html`

#### 6. `/orchestrate-tasks` - Advanced Orchestration
**Purpose**: Orchestrate implementation with custom standards per task group

**Phases**:
1. **Get tasks.md**: Confirm spec has tasks breakdown
2. **Create orchestration.yml**: List all task groups from tasks.md
3. **Assign Standards**: Ask user which standards apply to each task group
   - Options: "all", "global/*", "frontend/css.md", "backend/*", "none"
4. **Generate Prompts**: Create prompt files for each task group
   - Location: `implementation/prompts/[number]-[task-group-name].md`
   - Each prompt includes compiled standards references
   - Standards compilation logic: expand wildcards, deduplicate files

**Output Files**:
- `agent-os/specs/[dated-spec]/orchestration.yml`
- `agent-os/specs/[dated-spec]/implementation/prompts/[number]-[task-name].md` (one per task group)

## Standards System

The `/agent-os/standards/` directory contains coding standards and best practices that guide all implementation work.

### Standards Categories

#### Global Standards (`/global/`)
- **coding-style.md**: Naming conventions, formatting, DRY principle, no dead code
- **commenting.md**: Documentation approach
- **conventions.md**: Project-wide conventions
- **error-handling.md**: Error handling patterns
- **tech-stack.md**: Framework, runtime, database, testing tools (template to fill out)
- **validation.md**: Input validation standards

#### Backend Standards (`/backend/`)
- **api.md**: RESTful design, HTTP methods, status codes, versioning, rate limiting
- **migrations.md**: Database migration patterns
- **models.md**: Entity model conventions
- **queries.md**: Database query best practices

#### Frontend Standards (`/frontend/`)
- **accessibility.md**: WCAG compliance guidelines
- **components.md**: Single responsibility, reusability, composability, minimal props
- **css.md**: CSS organization and patterns
- **responsive.md**: Mobile-first responsive design

#### Testing Standards (`/testing/`)
- **test-writing.md**: TDD best practices, Red-Green-Refactor cycle, mock external dependencies

### Standards Compliance

All agent-os commands require adherence to relevant standards:
- Spec planning must align with global standards
- Implementation must follow backend/frontend/testing standards
- Orchestration allows custom standards per task group

## Key Workflows

### Complete Feature Development Workflow
```
1. /plan-product      → Define mission and roadmap
2. /shape-spec        → Research requirements with Q&A
3. /write-spec        → Create formal specification
4. /create-tasks      → Break down into task groups
5. /implement-tasks   → Implement and verify
   OR
5. /orchestrate-tasks → Advanced orchestration with custom standards
```

### Quick Feature Workflow (existing product)
```
1. /shape-spec    → Research requirements
2. /write-spec    → Create specification  
3. /create-tasks  → Create task breakdown
4. /implement-tasks → Build and verify
```

## File Structure Patterns

### Product Documentation
```
agent-os/product/
  ├── mission.md      # Product definition and goals
  ├── roadmap.md      # Feature checklist with effort estimates
  └── tech-stack.md   # Technology choices
```

### Spec Documentation
```
agent-os/specs/YYYY-MM-DD-feature-name/
  ├── spec.md
  ├── tasks.md
  ├── orchestration.yml  # If using orchestrate-tasks
  ├── planning/
  │   ├── initialization.md
  │   ├── requirements.md
  │   └── visuals/
  │       ├── mockup.png
  │       └── wireframe.jpg
  ├── implementation/
  │   └── prompts/       # If using orchestrate-tasks
  │       ├── 1-database-layer.md
  │       └── 2-api-layer.md
  └── verification/
      ├── screenshots/   # Browser test screenshots
      └── final-verification.html
```

## Important Implementation Guidelines

### When Working on Specs
1. **Always check for visual assets** after user responses (even if they say "no visuals")
2. **Search for existing code** to reuse before writing new components
3. **Reference similar features** when implementing new functionality
4. **Follow TDD approach** with focused tests (2-8 per task group)
5. **Update roadmap** when completing spec implementations

### Testing Philosophy
- Write tests **first** (Red-Green-Refactor)
- Keep tests **focused** on critical behaviors only
- Limit to **2-8 tests per task group** during development
- **Maximum 10 additional tests** in dedicated test gap analysis group
- Run **only feature-specific tests** during development (not entire suite)
- Test **behavior, not implementation**

### Standards References
When generating prompts or instructions, reference standards using:
```markdown
@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md
@agent-os/standards/frontend/components.md
```

### Visual Asset Handling
- Check with bash: `ls -la [path]/planning/visuals/ 2>/dev/null | grep -E '\.(png|jpg|jpeg|gif|svg|pdf)$'`
- Detect fidelity level from filename keywords
- Analyze each visual file found
- Ask clarifying questions if visuals differ from user's verbal description

### Code Reusability
- Always ask about existing similar features
- Document paths/names for spec-writer reference
- Search codebase before creating new components
- Follow established patterns in the codebase

## Configuration

The `agent-os/config.yml` indicates:
- **Version**: 2.1.1
- **Profile**: default
- **agent_os_commands**: enabled (true)
- **claude_code_commands**: disabled (false)

## Development Commands Reference

### Frontend (React + Vite)
- `npm run dev` - Development server (port 5173)
- `npm run build` - Production build
- `npm run lint` - ESLint check

### Backend (.NET 9)
- `dotnet run` - Run API (port 5000)
- `dotnet test` - Run test suite
- `dotnet build` - Build solution

### Docker
- `docker compose up` - Start all services
- `docker compose up frontend` - Frontend only
- `docker compose up backend postgres` - Backend + DB

## Best Practices

1. **Follow Sequential Phases**: Execute numbered instruction files in order
2. **Wait for User Input**: Stop and wait when instructions say "WAIT for user response"
3. **Mandatory Checks**: Always perform required bash commands (visual checks, etc.)
4. **Update Task Status**: Mark tasks complete (`- [x]`) as you finish them
5. **Save Screenshots**: Store browser test screenshots in `verification/screenshots/`
6. **Keep Specs Concise**: Follow bullet limits and section structures exactly
7. **Search First**: Always search for existing code before creating new components
8. **Test Strategically**: Write focused tests (2-8) per group, not comprehensive coverage
9. **Reference Standards**: Ensure all work aligns with relevant standards files
10. **Document Implementation**: Create verification reports and update roadmaps

## Anti-Patterns to Avoid

❌ Writing code in spec.md documents
❌ Skipping visual asset checks
❌ Writing comprehensive test suites (keep tests focused and limited)
❌ Running entire test suite during development phases
❌ Adding sections to spec.md that aren't in the template
❌ Creating new components without searching for existing patterns
❌ Deviating from numbered instruction sequence
❌ Continuing without user input when told to WAIT
