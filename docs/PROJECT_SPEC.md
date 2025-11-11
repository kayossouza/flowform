# Flowform Project Specification

## Table of Contents

1. [Overview](#overview)
2. [Core Vision](#core-vision)
3. [Hard Constraints](#hard-constraints)
4. [Technical Architecture](#technical-architecture)
5. [Data Model](#data-model)
6. [LLM Orchestration](#llm-orchestration)
7. [API Design](#api-design)
8. [MVP Scope](#mvp-scope)
9. [Non-Goals for MVP](#non-goals-for-mvp)
10. [Quality Standards](#quality-standards)

---

## Overview

**Flowform** is an open-source, AI-native conversational forms platform that replaces static web forms with intelligent conversational widgets.

### Problem Statement

Traditional web forms are:
- **Tedious** - Users face long forms with dozens of fields
- **High friction** - Every field is a decision point that increases abandonment
- **Inflexible** - No adaptation to user context or natural language input
- **Low conversion** - Form abandonment rates often exceed 70%

### Solution

Flowform enables:
- **Natural conversation** - Users describe their needs in plain language
- **Intelligent extraction** - LLMs parse structured data from free-text responses
- **Progressive disclosure** - Questions asked only as needed
- **Validation in context** - Errors caught and corrected conversationally

---

## Core Vision

### User Journey

1. **Form Creator** (Marketing team, Sales ops, Product team)
   - Logs into Flowform dashboard
   - Defines form schema (fields, types, validation rules)
   - Gets embed code (script tag or React component)
   - Adds to website/application

2. **End User** (Website visitor, lead, customer)
   - Sees conversational widget on website
   - Types natural language responses
   - Widget asks follow-up questions as needed
   - Submission happens seamlessly

3. **Data Consumer** (CRM, spreadsheet, internal system)
   - Receives structured JSON payload via webhook
   - Data is validated and normalized
   - Ready for immediate use in downstream systems

### Key Differentiators

- **Open source** - MIT license, self-hostable, no vendor lock-in
- **BYO API key** - User provides their own LLM keys, we never pay
- **Extensible** - Clean abstractions for adding LLM providers, integrations
- **Developer-first** - TypeScript, great DX, comprehensive testing

---

## Hard Constraints

### 1. Open Source

- **License**: MIT
- **Repository**: Public GitHub
- **No secrets**: All config via environment variables
- **Community-friendly**: Clear contribution guidelines, issue templates

### 2. BYO API Key (User Pays for LLM)

**Critical**: Flowform NEVER pays for LLM usage.

- Deployment requires user's own API keys
- Configuration via environment variables
- Clear documentation on obtaining keys
- Cost transparency - users see their own usage

**MVP Providers**:
- OpenAI (GPT-4o-mini, GPT-4o, GPT-4-turbo)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)

**Design Requirement**:
- Abstracted LLM interface for easy provider addition
- Provider detection via `LLM_PROVIDER` env var
- Fallback to mock provider for development/testing

### 3. Tech Stack (v1)

**Fixed Choices**:
- **Language**: TypeScript (100%, no JavaScript)
- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 14+ (App Router) + Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Prisma + PostgreSQL (Neon/Supabase compatible)
- **Testing**: Vitest (90%+ coverage target)
- **Linting**: ESLint 9+ (flat config), Prettier
- **Git hooks**: Husky + lint-staged

**Rationale**: Boring technology, battle-tested, great DX, easy to onboard contributors.

### 4. Code Quality Dictates Speed

**Philosophy**: Slow is smooth, smooth is fast.

**Requirements**:
- Small, coherent commits (no "god commits")
- Tests written alongside code, not after
- Pure functions for core logic (testable, portable)
- Strong types, zero `any`
- Clear diffs, updated types, basic tests for every change

**Process**:
1. Plan step
2. Show plan
3. Execute step
4. Show diff + explain
5. Verify tests pass
6. Repeat

### 5. No Over-Building for MVP

**Keep it simple**:
- Single workspace (no multi-tenant yet)
- One global LLM config (env-based)
- Webhooks only (no integration catalog)
- No streaming UI (basic request/response)
- No authentication (focus on core value)

**Post-MVP considerations** (explicitly deferred):
- Multi-workspace/teams
- User roles and permissions
- SSO/OAuth
- Streaming responses
- A/B testing
- Analytics dashboard
- Integration marketplace

---

## Technical Architecture

### High-Level Structure

```
flowform/
├── packages/
│   ├── core/          # Pure domain logic (orchestration, validation)
│   ├── llm/           # LLM abstraction (OpenAI, Anthropic, config)
│   └── ui/            # Shared React components (future)
├── apps/
│   └── web/           # Next.js (dashboard + API + embed)
└── docs/              # Specifications and guides
```

### Layer Diagram

```
┌──────────────────────────────────────────┐
│   apps/web (Next.js)                     │
│   - Dashboard UI                         │
│   - API routes                           │
│   - Embed endpoints                      │
└──────────────────────────────────────────┘
                 │
                 │ imports
                 ↓
┌──────────────────────────────────────────┐
│   packages/core                          │
│   - Types (FormDefinition, Session)      │
│   - Validation (validateField)           │
│   - Orchestrator (runLlmStep)            │
└──────────────────────────────────────────┘
                 │
                 │ injects
                 ↓
┌──────────────────────────────────────────┐
│   packages/llm                           │
│   - LlmClient interface                  │
│   - OpenAI provider                      │
│   - Anthropic provider                   │
│   - Config resolver                      │
└──────────────────────────────────────────┘
```

### packages/core (Pure Domain Logic)

**Purpose**: Framework-agnostic business logic. Could run in CLI, mobile, edge functions.

**Key Modules**:

1. **types/** - Domain types
   - `FormDefinition`, `FormField`, `FieldType`
   - `Session`, `SessionField`, `SessionTurn`
   - `FieldValue` union types

2. **validation/** - Field validation
   - `validateField(field, value)` - Pure function
   - Built-in validators: email, phone, number, date, enum
   - Custom validation rules support

3. **orchestrator/** - Conversation logic
   - `runLlmStep(form, session, userMessage, llmClient)` - Core function
   - `buildPrompt(form, session)` - Construct LLM prompt
   - `parseResponse(response)` - Extract structured data
   - State machine for conversation flow

**Test Coverage**: 95%+ (pure functions, easy to test)

### packages/llm (Provider Abstraction)

**Purpose**: Clean interface for swapping LLM providers.

**Key Modules**:

1. **client.ts** - Interface definition
```typescript
interface LlmClient {
  complete(messages: LlmMessage[]): Promise<LlmResponse>;
}
```

2. **config.ts** - Environment-based config
```typescript
function readLlmConfig(): LlmConfig {
  const provider = process.env.LLM_PROVIDER;
  // Returns OpenAIConfig | AnthropicConfig
}
```

3. **providers/** - Implementations
   - `openai.ts` - OpenAI client (using SDK)
   - `anthropic.ts` - Anthropic client (using SDK)
   - Both implement `LlmClient` interface

**Design Principle**: Adding new provider = one new file implementing `LlmClient`.

**Test Coverage**: 85%+ (config resolution, error handling)

### apps/web (Next.js Application)

**Purpose**: User-facing dashboard, API routes, embed endpoints.

**Structure**:
```
apps/web/
├── app/
│   ├── (dashboard)/        # Dashboard routes
│   │   ├── page.tsx        # Forms list
│   │   ├── forms/
│   │   │   ├── new/        # Form builder
│   │   │   ├── [id]/       # Form details
│   │   │   └── [id]/edit   # Edit form
│   │   └── submissions/    # View submissions
│   ├── api/                # API routes
│   │   ├── forms/          # CRUD for forms
│   │   ├── sessions/       # Create session, send message
│   │   └── submissions/    # Submit completed form
│   └── embed/              # Public embed endpoints
│       └── [formId]/       # Embed widget page
├── components/             # React components
│   ├── forms/              # Form-related components
│   ├── ui/                 # Base UI components
│   └── embed/              # Embed widget components
├── lib/                    # App utilities
│   ├── prisma.ts           # Prisma client singleton
│   ├── llm.ts              # LLM client initialization
│   └── logger.ts           # Logging utility
└── prisma/
    └── schema.prisma       # Database schema
```

---

## Data Model

### Entity Relationship Diagram

```
Form (1) ───── (N) FormField
  │
  │ (1)
  │
  ├─── (N) Session ───── (N) SessionTurn
  │         │
  │         └─── (N) SessionField
  │
  ├─── (1) FormWebhook
  │
  └─── (N) Submission ───── (N) WebhookDelivery
```

### Prisma Schema

#### Form
```prisma
model Form {
  id          String   @id @default(cuid())
  name        String
  description String?

  fields      FormField[]
  webhook     FormWebhook?
  sessions    Session[]
  submissions Submission[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### FormField
```prisma
model FormField {
  id          String    @id @default(cuid())
  formId      String
  form        Form      @relation(fields: [formId], references: [id], onDelete: Cascade)

  name        String    // Technical name (e.g., "email")
  label       String    // Display name (e.g., "Email Address")
  type        FieldType
  required    Boolean   @default(false)
  validation  Json?     // Custom validation rules

  order       Int       // Display order

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([formId])
}

enum FieldType {
  TEXT
  EMAIL
  PHONE
  NUMBER
  DATE
  ENUM
  LONG_TEXT
}
```

#### Session
```prisma
model Session {
  id           String         @id @default(cuid())
  formId       String
  form         Form           @relation(fields: [formId], references: [id], onDelete: Cascade)

  status       SessionStatus  @default(ACTIVE)

  turns        SessionTurn[]
  fields       SessionField[]

  startedAt    DateTime       @default(now())
  completedAt  DateTime?

  @@index([formId])
}

enum SessionStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}
```

#### SessionTurn
```prisma
model SessionTurn {
  id        String   @id @default(cuid())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  role      TurnRole
  content   String   @db.Text

  createdAt DateTime @default(now())

  @@index([sessionId])
}

enum TurnRole {
  USER
  ASSISTANT
}
```

#### SessionField
```prisma
model SessionField {
  id        String  @id @default(cuid())
  sessionId String
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  fieldName String  // Matches FormField.name
  value     Json    // Validated value

  @@unique([sessionId, fieldName])
}
```

#### FormWebhook
```prisma
model FormWebhook {
  id        String  @id @default(cuid())
  formId    String  @unique
  form      Form    @relation(fields: [formId], references: [id], onDelete: Cascade)

  url       String
  headers   Json?   // Custom headers

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Submission
```prisma
model Submission {
  id        String   @id @default(cuid())
  formId    String
  form      Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  sessionId String?  // Optional link to session

  data      Json     // Submitted form data

  deliveries WebhookDelivery[]

  createdAt DateTime @default(now())

  @@index([formId])
}
```

#### WebhookDelivery
```prisma
model WebhookDelivery {
  id           String           @id @default(cuid())
  submissionId String
  submission   Submission       @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  status       DeliveryStatus   @default(PENDING)
  url          String

  attempts     Int              @default(0)
  lastAttempt  DateTime?
  response     Json?            // HTTP response details

  createdAt    DateTime         @default(now())

  @@index([submissionId])
}

enum DeliveryStatus {
  PENDING
  SUCCESS
  FAILED
  RETRYING
}
```

---

## LLM Orchestration

### Core Function: runLlmStep

**Signature**:
```typescript
function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient
): Promise<{
  botResponse: string;
  extractedFields: Record<string, unknown>;
  isComplete: boolean;
  nextField?: string;
}>
```

**Algorithm**:

1. **Build context**
   - Form schema (fields, types, validation)
   - Session history (previous turns)
   - Already collected fields

2. **Construct prompt**
   ```
   You are a form assistant. Collect these fields:
   - name (text, required)
   - email (email, required)
   - phone (phone, optional)

   Collected so far: { name: "Alice" }

   User: "alice@example.com"

   Extract email and ask for next field if needed.
   ```

3. **Call LLM**
   - Send prompt to `llmClient.complete()`
   - Receive structured response

4. **Parse response**
   - Extract field values from LLM output
   - Validate each field
   - Determine if form is complete

5. **Return result**
   - Bot response (next question or completion message)
   - Extracted fields (with validation)
   - Completion status
   - Next field to ask (if not complete)

### Prompt Engineering Strategy

**System Prompt Template**:
```
You are a conversational form assistant for Flowform.

TASK: Help users fill out this form by asking questions naturally.

FORM SCHEMA:
{fields}

COLLECTED FIELDS:
{collectedFields}

CONVERSATION HISTORY:
{history}

INSTRUCTIONS:
1. Extract values from user messages
2. Validate extracted values against field types
3. If value is invalid, ask for correction politely
4. If all required fields are collected, say "Thank you! Form complete."
5. Otherwise, ask for the next missing field

RESPONSE FORMAT (JSON):
{
  "botMessage": "Your natural language response",
  "extractedFields": { "fieldName": value },
  "isComplete": boolean,
  "nextField": "field_name" or null
}
```

**Design Principles**:
- Keep prompts concise (under 2000 tokens)
- Include only relevant context
- Use JSON mode for structured output
- Handle ambiguous inputs gracefully

---

## API Design

### REST Endpoints

#### Forms

**POST /api/forms**
Create new form
```json
{
  "name": "Contact Form",
  "description": "Get in touch with us",
  "fields": [
    { "name": "name", "label": "Your Name", "type": "TEXT", "required": true },
    { "name": "email", "label": "Email", "type": "EMAIL", "required": true }
  ]
}
```

**GET /api/forms**
List all forms
```json
{
  "forms": [
    { "id": "...", "name": "Contact Form", "createdAt": "..." }
  ]
}
```

**GET /api/forms/[id]**
Get single form with fields
```json
{
  "id": "...",
  "name": "Contact Form",
  "fields": [...]
}
```

**PUT /api/forms/[id]**
Update form

**DELETE /api/forms/[id]**
Delete form

#### Sessions

**POST /api/sessions**
Create new session for a form
```json
{
  "formId": "clx..."
}
```

Response:
```json
{
  "sessionId": "clx...",
  "message": "Hi! I'm here to help you fill out the form. What's your name?"
}
```

**POST /api/sessions/[id]/messages**
Send user message, get bot response
```json
{
  "message": "My name is Alice and my email is alice@example.com"
}
```

Response:
```json
{
  "botMessage": "Got it! What's your phone number?",
  "collectedFields": {
    "name": "Alice",
    "email": "alice@example.com"
  },
  "isComplete": false
}
```

#### Submissions

**POST /api/submissions**
Submit completed form
```json
{
  "formId": "clx...",
  "sessionId": "clx...",
  "data": {
    "name": "Alice",
    "email": "alice@example.com",
    "phone": "+1234567890"
  }
}
```

Response:
```json
{
  "submissionId": "clx...",
  "webhookDelivered": true
}
```

**GET /api/submissions?formId=clx...**
List submissions for form

---

## MVP Scope

### Phase 1: Foundation (Week 1-2)
- ✅ Monorepo setup (pnpm + Turborepo + TypeScript)
- ✅ Shared configs (ESLint, Prettier, Vitest)
- ✅ Docker Compose for Postgres
- ✅ Documentation (this file)

### Phase 2: Core Package (Week 2-3)
- [ ] Domain types (Form, Session, Field)
- [ ] Validation logic with tests
- [ ] Orchestrator core with tests
- [ ] 95%+ test coverage

### Phase 3: LLM Package (Week 3-4)
- [ ] LlmClient interface
- [ ] Config resolver with tests
- [ ] OpenAI provider
- [ ] Anthropic provider
- [ ] Provider switching via env var

### Phase 4: Database (Week 4-5)
- [ ] Prisma schema
- [ ] Migrations
- [ ] Seed script with sample data

### Phase 5: API Routes (Week 5-6)
- [ ] Forms CRUD endpoints
- [ ] Sessions create + message endpoints
- [ ] Submissions endpoint
- [ ] Integration tests

### Phase 6: Dashboard UI (Week 6-8)
- [ ] Forms list page
- [ ] Form builder
- [ ] Form edit
- [ ] Submissions viewer

### Phase 7: Embed Widget (Week 8-9)
- [ ] Chat widget UI
- [ ] Embed page
- [ ] Script tag embed
- [ ] React component export

### Phase 8: Webhooks (Week 9-10)
- [ ] Webhook configuration
- [ ] Delivery logic with retries
- [ ] Delivery status tracking

---

## Non-Goals for MVP

Explicitly out of scope for v1:

- **Authentication/Authorization** - Focus on core value first
- **Multi-workspace/Teams** - Single workspace only
- **User roles** - No RBAC
- **Streaming responses** - Basic request/response
- **A/B testing** - No experimentation framework
- **Analytics dashboard** - No usage metrics UI
- **Integration marketplace** - Webhooks only
- **Custom branding** - Default styling only
- **Mobile apps** - Web-first
- **Internationalization** - English only
- **Accessibility audit** - Basic a11y, not WCAG 2.1 AA certified

These are important but can wait until product-market fit is proven.

---

## Quality Standards

### Code Quality

- **TypeScript strict mode** - No `any`, all exports typed
- **Function size** - Max 60 lines, single responsibility
- **File size** - Max 350 lines
- **Cyclomatic complexity** - Max 12
- **Test coverage** - 90%+ overall, 95%+ for packages/core
- **Naming** - Clear, intent-revealing names

### Testing Strategy

1. **Unit tests** - All pure functions (validation, orchestration)
2. **Integration tests** - API endpoints, database queries
3. **E2E tests** - Critical user flows (create form, complete conversation)

**No mocks for infrastructure** - Use real Postgres with transactions + rollback.

### Performance Targets

- **API response time** - p95 < 500ms (excluding LLM call)
- **LLM call time** - p95 < 3s (depends on provider)
- **Database query time** - p95 < 50ms
- **Dashboard page load** - < 2s

### Git Workflow

- **Commit size** - Small, coherent changes
- **Commit messages** - Conventional Commits format
- **Pre-commit hooks** - Lint + format + related tests
- **Pre-push hooks** - Full test suite + type-check
- **CI checks** - Lint + test + type-check on all PRs

---

## Appendices

### Glossary

- **Form Definition** - Schema defining fields to collect
- **Session** - A single conversation instance with a user
- **Turn** - One message in the conversation (user or assistant)
- **Orchestrator** - The core logic that drives the conversation
- **LLM Client** - Abstraction for calling different LLM providers

### References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [Vitest Documentation](https://vitest.dev/)

---

**Last Updated**: 2025-01-10
**Version**: 1.0.0
**Status**: Active Development
