# Documentation Index

Welcome to the Cash Caddy documentation. This directory contains comprehensive diagrams and documentation for understanding the system architecture, workflows, and development processes.

## 📂 Documentation Structure

```
docs/
├── README.md                    # This file
└── diagrams/                    # Mermaid diagram documentation
    ├── architecture.md          # System architecture diagrams
    ├── workflows.md            # Application workflow diagrams
    └── agent-os-flow.md        # Agent-OS development flow diagrams
```

## 📊 Available Diagrams

### Architecture Diagrams (`diagrams/architecture.md`)

Comprehensive system architecture documentation including:

- **High-Level Architecture** - Overall system layers and components
- **Component Architecture** - Frontend and backend component relationships
- **Technology Stack** - Complete technology stack visualization
- **Data Flow Architecture** - Request/response sequence flows
- **Deployment Architecture** - Docker compose container architecture
- **Directory Structure** - Project folder organization

**Best for:** Understanding how the entire system is structured and how components interact.

### Workflow Diagrams (`diagrams/workflows.md`)

Application-specific workflow documentation including:

- **User Workflow: Create Expense** - Complete user interaction flow
- **API Request Flow** - HTTP request lifecycle
- **CRUD Operations Flow** - State machine for data operations
- **Application Startup Flow** - Container initialization sequence
- **Data Persistence Flow** - Database interaction flow
- **Component Lifecycle Flow** - React component rendering sequence
- **Error Handling Flow** - Exception and error management

**Best for:** Understanding how users interact with the application and how data flows through the system.

### Agent-OS Flow Diagrams (`diagrams/agent-os-flow.md`)

Development process and agent-os workflow documentation including:

- **Complete Feature Development Workflow** - End-to-end feature development process
- **Agent-OS Command Structure** - All available commands and their phases
- **Spec Folder Structure Evolution** - How spec folders grow through the workflow
- **Testing Strategy Flow** - TDD approach with test limits
- **Standards Application Flow** - How coding standards are applied
- **Visual Asset Processing Flow** - Handling mockups and wireframes
- **Orchestration vs Simple Implementation** - Comparison of implementation approaches

**Best for:** Understanding how to use agent-os for feature planning and implementation.

## 🎯 Quick Reference

### For New Developers

1. Start with **Architecture Diagrams** to understand the system structure
2. Review **Workflow Diagrams** to see how features work
3. Learn **Agent-OS Flow** to understand the development process

### For Feature Development

1. Follow **Agent-OS Flow Diagrams** for the complete workflow
2. Reference **Architecture Diagrams** for integration points
3. Use **Workflow Diagrams** to understand existing patterns

### For Bug Fixes

1. Use **Workflow Diagrams** to trace the issue
2. Reference **Architecture Diagrams** to identify affected components
3. Check **Error Handling Flow** for proper error management

## 🔧 Technology Stack

This project uses:

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** .NET 9 Web API with Minimal APIs
- **Database:** PostgreSQL + Entity Framework Core
- **Development:** Docker Compose
- **Workflow:** Agent-OS 2.1.1

## 📝 Viewing Diagrams

All diagrams are written in **Mermaid** format and can be viewed in:

- **GitHub** - Automatically rendered in markdown files
- **VS Code** - Use Mermaid preview extensions
- **Mermaid Live Editor** - https://mermaid.live/

## 🚀 Getting Started

### Run the Application

```bash
# Start all services
docker compose up

# Frontend only (requires backend running)
cd frontend/cash-caddy-ui && npm run dev

# Backend only (requires PostgreSQL)
cd backend/src/CashCaddy && dotnet run
```

### Using Agent-OS

```bash
# Plan a new product
Follow: agent-os/commands/plan-product/plan-product.md

# Create a new feature spec
Follow: agent-os/commands/shape-spec/shape-spec.md

# Implement tasks
Follow: agent-os/commands/implement-tasks/implement-tasks.md
```

## 📚 Additional Documentation

- **`CLAUDE.md`** - Claude Code editor guidance
- **`.github/copilot-instructions.md`** - GitHub Copilot integration guide
- **`agent-os/standards/`** - Coding standards and best practices
- **`agent-os/commands/`** - Detailed command instructions

## 🤝 Contributing

When adding new features:

1. Follow the agent-os workflow documented in `diagrams/agent-os-flow.md`
2. Ensure compliance with standards in `agent-os/standards/`
3. Update diagrams if architecture or workflows change
4. Document new patterns and components

## 📖 Related Files

- **Product Documentation:** `agent-os/product/`
- **Feature Specs:** `agent-os/specs/`
- **Coding Standards:** `agent-os/standards/`
- **Development Guide:** `CLAUDE.md`

---

*For more information, see the main project README.md*
