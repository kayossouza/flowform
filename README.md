# Flowform

Open-source platform for conversational forms powered by LLMs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/Coverage-98.62%25-brightgreen.svg)](./packages/core)

[English](./README.md) | [Português](./README.pt-BR.md)

**[Quick Start](#quick-start) · [Documentation](./docs) · [Architecture](./docs/ARCHITECTURE.md) · [Contributing](./CONTRIBUTING.md)**

---

## Overview

Flowform transforms traditional web forms into natural conversations. Instead of forcing users through rigid field-by-field forms, it uses LLMs to extract structured data from natural language.

**Current Status:** v0.1.0 - Core orchestrator complete and production-ready

---

## The Problem

Traditional web forms have fundamental issues:

- **High abandonment rates** (70%+): Every field adds friction
- **Poor user experience**: Forms feel like interrogations
- **Inflexible**: Can't handle natural language input
- **One-size-fits-all**: No adaptation to context

**Cost:** Billions in lost conversions, millions of wasted hours

---

## The Solution

Replace forms with LLM-powered conversations:

### Before: Traditional Form
```
Name: [________]
Email: [________]
Phone: [________]
Company: [________]
Message: [________]
```
5 fields. 5 decisions. 5 chances to abandon.

### After: Conversational Flow
```
User: "I need a demo of your product for my team at Acme Corp"
Bot: "Thanks! I'll set that up. What's the best email to send the details?"
User: "john@acme.com"
Bot: "Perfect. I'll send the demo information to john@acme.com"
```
Structured data captured automatically from natural conversation.

### How It Works

```
User Input (Natural Language)
    ↓
LLM Extraction
    ↓
Real-time Validation
    ↓
Structured JSON Output
```

1. **Natural input**: Users type conversationally
2. **AI extraction**: LLMs parse and extract structured fields
3. **Real-time validation**: Conversational error correction
4. **System integration**: Clean JSON to webhooks, CRMs, databases

---

## Why Open Source

Infrastructure for the AI era should be owned by everyone.

**Principles:**
- **No vendor lock-in**: Self-host anywhere
- **Privacy-first**: BYO API keys, your data never touches our servers
- **Community-driven**: Best ideas win
- **Built to last**: Not tied to a startup's survival

Flowform is infrastructure like Linux, Postgres, or React. Free, open, community-owned.

---

## Features

### v0.1.0 - Core Orchestrator (Production Ready)

**@flowform/core package**
- Pure function orchestrator (98.62% test coverage)
- Complete type system (FormDefinition, Session, validation)
- 7 field types with validation (TEXT, EMAIL, PHONE, NUMBER, DATE, ENUM, LONG_TEXT)
- Multi-turn conversation support with context preservation
- 75 test cases (unit, integration, edge cases)
- Zero runtime dependencies
- Framework-agnostic (React, Vue, Node.js, edge functions)
- LLM-agnostic (OpenAI, Anthropic, custom providers)

**Infrastructure**
- Production-grade monorepo (Turborepo + TypeScript project references)
- Shared configs (ESLint, Prettier, Vitest)
- Quality automation (git hooks, strict linting, 85%+ coverage enforced)
- 25,000+ words of technical documentation
- Clean architecture (pure domain logic, zero side effects)

### v1.0 - MVP (Q1 2025)

**In Progress:**
- Core domain logic (COMPLETE)

**Planned:**
- LLM abstraction package (OpenAI, Anthropic adapters)
- Web dashboard (Next.js)
- Form builder UI
- Submissions viewer
- Webhook delivery with retries
- Database layer (Prisma + PostgreSQL)
- Embed widget (script tag, React, iframe)

### v1.1+ - Roadmap

- CRM integrations (Salesforce, HubSpot, Pipedrive)
- Conditional logic (skip/show fields based on answers)
- Analytics (conversion funnels, drop-off analysis, A/B testing)
- Multi-workspace support (teams, roles, permissions)
- File uploads in conversations
- i18n (multi-language support)

[Full roadmap](./docs/TASKS_MVP.md)

---

## Quick Start

### Prerequisites

```bash
node -v   # 20+
pnpm -v   # 9+
```

Plus: OpenAI or Anthropic API key

### Installation

```bash
# Clone repository
git clone https://github.com/kayossouza/flowform.git
cd flowform

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your API key to .env

# Start database (for future web app)
pnpm db:up

# Run migrations (for future web app)
pnpm db:migrate

# Start development
pnpm dev
```

### Using @flowform/core

```bash
pnpm add @flowform/core
```

```typescript
import {
  runLlmStep,
  type FormDefinition,
  type Session,
  FieldType,
  SessionStatus,
} from '@flowform/core';

// Define form schema
const form: FormDefinition = {
  id: 'contact',
  name: 'Contact Form',
  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'Name',
      type: FieldType.TEXT,
      required: true,
      order: 0,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: FieldType.EMAIL,
      required: true,
      order: 1,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Initialize session
const session: Session = {
  id: 'session-1',
  formId: 'contact',
  status: SessionStatus.ACTIVE,
  turns: [],
  fields: [],
  startedAt: new Date(),
};

// Process user input
const result = await runLlmStep(
  form,
  session,
  'My name is John and email is john@example.com',
  llmClient
);

console.log(result.extractedFields);
// Output: { name: "John", email: "john@example.com" }
```

[Complete documentation](./packages/core/README.md)

---

## Architecture

### Structure

```
apps/web (Next.js)
    Dashboard + API + Embed Widget
    ↓ imports
packages/core (Pure TypeScript)
    Types · Validation · Orchestration
    Zero Dependencies
    ↓ uses (dependency injection)
packages/llm (Future)
    Provider Abstraction (OpenAI, Anthropic)
```

### Design Principles

**Clean Architecture Meets AI**

The orchestrator is a pure function with no side effects:
- 100% testable (mock the LLM, test all paths)
- Portable (CLI, mobile, edge, anywhere)
- Predictable (same inputs = same outputs)
- Maintainable (clear boundaries)

**BYO API Key Model**

Your data never touches our servers:
- Your infrastructure
- Your API keys
- Your conversations
- Your data

Not a business model. A principle.

[Full architecture](./docs/ARCHITECTURE.md)

---

## Tech Stack

**Frontend**
- Next.js 14+ (App Router, React Server Components)
- React 18
- Tailwind CSS

**Backend**
- Next.js API Routes (serverless)
- Prisma (type-safe ORM)
- PostgreSQL

**Monorepo**
- pnpm (fast, disk-efficient)
- Turborepo (high-performance builds)
- TypeScript Project References (incremental compilation)

**Quality**
- Vitest (unit + integration testing)
- ESLint 9 (flat config, TypeScript-aware)
- Husky (git hooks for quality gates)

**LLM Providers**
- OpenAI (gpt-4o-mini, gpt-4o, gpt-4-turbo)
- Anthropic (claude-3.5-sonnet, claude-3-opus)
- Extensible (add new providers easily)

---

## Development

### Requirements

**Quality standards:**
- Functions ≤60 lines (single responsibility)
- Files ≤350 lines (clear boundaries)
- 85%+ coverage (tests are required)
- Zero `any` types (TypeScript strict mode)
- Git hooks (quality gates run automatically)

### Commands

```bash
pnpm dev           # Start development
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm check         # type-check + lint + test (run before pushing)
pnpm build         # Build all packages
```

[Development guide](./docs/DEVELOPMENT.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [Project Spec](./docs/PROJECT_SPEC.md) | Complete technical specification |
| [Architecture](./docs/ARCHITECTURE.md) | Design decisions, patterns, trade-offs |
| [Task Breakdown](./docs/TASKS_MVP.md) | 11 phases, 300+ granular tasks |
| [Development Guide](./docs/DEVELOPMENT.md) | Setup, workflow, troubleshooting |
| [CHANGELOG](./CHANGELOG.md) | Version history and release notes |
| [v0.1.0 Release](./docs/releases/v0.1.0.md) | Core orchestrator release details |

---

## Contributing

This is infrastructure. Contributions help everyone.

### How to Contribute

- Report bugs: [Open an issue](https://github.com/kayossouza/flowform/issues)
- Suggest features: [Start a discussion](https://github.com/kayossouza/flowform/discussions)
- Improve docs: Clarity helps everyone
- Write code: Pick a task from [TASKS_MVP.md](./docs/TASKS_MVP.md)
- Add tests: More coverage is always valuable

### Development Philosophy

```
Quality > Speed
Clarity > Cleverness
Tests > Features
Community > Company
```

- Small commits (atomic changes)
- Test-first (write tests alongside code)
- No hacks (fix technical debt immediately)
- Document everything (future maintainers depend on it)

### Getting Help

- Discussions: [GitHub Discussions](https://github.com/kayossouza/flowform/discussions)
- Issues: [GitHub Issues](https://github.com/kayossouza/flowform/issues)
- First time? Look for [`good first issue`](https://github.com/kayossouza/flowform/labels/good%20first%20issue)

[Contributing guide](./CONTRIBUTING.md)

---

## Deployment (Coming in v1.0)

Self-host anywhere you want. Full control.

### One-Click Deploy

**Vercel** (Recommended)
```bash
vercel deploy
```

**Railway**
```bash
railway up
```

**Netlify**
```bash
netlify deploy
```

### Self-Hosted (Docker)

```bash
docker build -t flowform .

docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e LLM_PROVIDER="openai" \
  -e OPENAI_API_KEY="sk-..." \
  flowform
```

No vendor lock-in. Full control.

---

## Roadmap

### v0.1 - Foundation + Core (COMPLETE)
- Production-grade monorepo
- TypeScript strict mode + project references
- 25,000+ words of documentation
- Quality automation (git hooks, linting, testing)
- @flowform/core package (98.62% coverage)
- Complete type system
- 7 field types with comprehensive validation
- Multi-turn conversations with context
- 75 test cases
- Zero dependencies

### v1.0 - MVP (Q1 2025)
- Core domain logic (COMPLETE)
- LLM abstraction package
- Web dashboard
- Form builder UI
- Submissions viewer
- Webhook delivery
- Database layer
- Embed widget

### v1.1 - Integrations (Q2 2025)
- Salesforce, HubSpot, Pipedrive connectors
- Conditional logic
- File uploads

### v2.0 - Scale (Q3 2025)
- Multi-workspace support
- User roles & permissions
- A/B testing
- Analytics dashboard
- i18n

[View all 300+ tasks](./docs/TASKS_MVP.md)

---

## License

MIT License - See [LICENSE](./LICENSE)

Use freely. Modify freely. Contribute if you can.

---

## Acknowledgments

**Core Contributors:**
- [@kayossouza](https://github.com/kayossouza)

**Built with:**
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Turborepo](https://turbo.build/repo)
- [Vitest](https://vitest.dev/)
- [pnpm](https://pnpm.io/)

---

**Current Status:** v0.1.0 Released - Core Orchestrator Production Ready (98.62% coverage)

Open Source · MIT License · Community Owned

[Get Started](#quick-start) · [Documentation](#documentation) · [Contributing](#contributing)
