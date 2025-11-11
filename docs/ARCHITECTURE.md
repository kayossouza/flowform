# Flowform Architecture

Clean Architecture. Pure functions. SOLID principles. That's it.

---

## The Big Picture

```
┌─────────────────────────────────────┐
│  Presentation (apps/web/app)        │
│  React components, pages, UI        │
└─────────────────┬───────────────────┘
                  ↓ uses
┌─────────────────────────────────────┐
│  Application (apps/web/lib)         │
│  API routes, DB queries, use cases  │
└─────────────────┬───────────────────┘
                  ↓ imports
┌─────────────────────────────────────┐
│  Domain (packages/core)             │
│  Pure TypeScript, ZERO dependencies │
│  Types, validation, orchestration   │
└─────────────────┬───────────────────┘
                  ↓ uses (injected)
┌─────────────────────────────────────┐
│  Infrastructure (packages/llm)      │
│  LLM clients (OpenAI, Anthropic)    │
└─────────────────────────────────────┘
```

**The Rule:** Dependencies point inward only.

Domain depends on **nothing**. Not even logging.

---

## Core Insight: The Orchestrator is Pure

```typescript
async function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient  // Injected, not imported!
): Promise<OrchestratorResult>
```

**Pure means:**
- No side effects (no DB, no API calls, no logging)
- No global state
- Same inputs → same outputs
- 100% testable

**Why pure?**
- Test without mocks
- Run anywhere (CLI, mobile, edge, lambda)
- Predict behavior
- Parallelize safely

See ADR-0002 for full rationale.

---

## Four Rules of Simple Design

Kent Beck's rules. Every line of code must follow them:

1. **Passes all tests**
   - If it doesn't work, nothing else matters
   - Tests prove it works

2. **Reveals intention**
   - Code says what it does
   - Names are clear
   - No comments needed

3. **No duplication**
   - DRY
   - Extract common patterns
   - One source of truth

4. **Fewest elements**
   - Minimize classes, functions, variables
   - Simple is better than complex
   - Delete code aggressively

**In order of priority.** Working code beats elegant code. Elegant code beats minimal code.

---

## SOLID Principles

### Single Responsibility Principle
One module, one reason to change.

```typescript
// ✅ Good
class FormValidator { validate() { } }
class FormRepository { save() { } }
class EmailService { sendEmail() { } }

// ❌ Bad
class FormHandler {
  validate() { }  // Validation
  save() { }      // Persistence
  sendEmail() { } // Notification
}
```

### Open/Closed Principle
Open for extension, closed for modification.

```typescript
// ✅ Good: Add providers without changing orchestrator
interface LlmClient {
  complete(messages: Message[]): Promise<Response>;
}

class OpenAIClient implements LlmClient { }
class AnthropicClient implements LlmClient { }
class GeminiClient implements LlmClient { } // New! No orchestrator changes
```

### Liskov Substitution Principle
Subtypes must be substitutable.

```typescript
// Any LlmClient works identically
function process(client: LlmClient) {
  return client.complete(messages);
}

// All work the same
process(new OpenAIClient());
process(new AnthropicClient());
process(new MockLlmClient());
```

### Interface Segregation Principle
Clients shouldn't depend on unused methods.

```typescript
// ✅ Good: Minimal interface
interface LlmClient {
  complete(messages: Message[]): Promise<Response>;
}

// ❌ Bad: Fat interface
interface LlmClient {
  complete(): Promise<Response>;
  streamComplete(): AsyncIterator<Response>;  // Not all support
  getUsage(): TokenUsage;                     // Not all track
  getModelInfo(): ModelInfo;                  // Not all expose
}
```

### Dependency Inversion Principle
Depend on abstractions, not concretions.

```typescript
// ✅ Good: Depends on interface
function runOrchestrator(client: LlmClient) {
  return client.complete(messages);
}

// ❌ Bad: Depends on concrete class
import { OpenAIClient } from './openai';
function runOrchestrator() {
  const client = new OpenAIClient();  // Tight coupling!
}
```

---

## Error Handling

Four categories. Handle each differently.

### 1. Validation Errors (User's Fault)
Return result, don't throw.

```typescript
function validateEmail(value: string): ValidationResult {
  if (!EMAIL_REGEX.test(value)) {
    return { valid: false, error: 'Invalid email' };
  }
  return { valid: true };
}
```

### 2. Client Errors (Caller's Fault)
Throw with context. Log warning. Don't retry.

```typescript
if (!apiKey) {
  throw new ClientError(
    'API key required',
    401,
    'MISSING_API_KEY'
  );
}
```

### 3. Server Errors (System's Fault)
Throw with context. Log error. Retry with backoff.

```typescript
try {
  await database.query(sql);
} catch (error) {
  throw new ServerError(
    'Database query failed',
    500,
    error as Error
  );
}
```

### 4. Bugs (Programmer's Fault)
Let it crash. Fix the bug. Don't catch.

---

## Monorepo Structure

### Packages
```
packages/
  core/           - Domain logic (zero dependencies)
  llm/            - LLM provider abstraction
  ui/             - Shared React components (future)
  eslint-config/  - Shared linting rules
  typescript-config/ - Shared TS configs
```

**Layering:**
- `core` imports from: nothing
- `llm` imports from: core
- `ui` imports from: core (not llm)

### Apps
```
apps/
  web/   - Next.js dashboard + API + embed widget
  cli/   - CLI tool (future)
```

**Apps are thin wrappers.** All logic in packages.

---

## TypeScript Project References

**Why:** Incremental builds that scale.

**Without project references:**
- Change one type in `core`
- Rebuild all 10 apps
- Wait 15 minutes

**With project references:**
- Change one type in `core`
- Rebuild only affected packages
- Wait 30 seconds

**How:**
- Root `tsconfig.json` references all packages
- Each package: `composite: true` + `declaration: true`
- TypeScript generates `.tsbuildinfo` for incremental compilation

See `tsconfig.json` and `tsconfig.base.json` for configuration.

---

## Design Decisions

All major decisions documented in ADRs:

- [ADR-0001: Clean Architecture](./adr/0001-use-clean-architecture.md)
- [ADR-0002: Pure Function Orchestrator](./adr/0002-pure-function-orchestrator.md)
- [ADR-0003: BYO API Key Model](./adr/0003-byo-api-key-model.md)

Write new ADRs for:
- Technology choices (databases, frameworks, libraries)
- Architecture patterns
- Trade-offs (consistency vs availability, etc.)
- Conventions that affect multiple packages

Template in `docs/adr/README.md`.

---

## Key Constraints

**Hard limits:**
- Functions: ≤60 lines
- Files: ≤350 lines
- Cyclomatic complexity: ≤12
- Test coverage: ≥90% (core: ≥95%)
- No `any` types
- No `console.log` (use logger)

**Enforced by:**
- ESLint (functions, complexity, `any`)
- Vitest (coverage)
- Code review (files)
- Git hooks (pre-commit checks)

---

## Trade-offs

### Monorepo vs Polyrepo
**Choice:** Monorepo

**Why:** Atomic commits, shared code, easier refactoring
**Cost:** Requires good tooling (Turborepo, pnpm)

### Pure Functions vs Object-Oriented
**Choice:** Pure functions for domain logic

**Why:** 100% testable, portable, predictable
**Cost:** More explicit (must pass dependencies)

### TypeScript Strict Mode
**Choice:** Strict mode always on

**Why:** Catch bugs at compile time
**Cost:** More verbose type annotations

### No Mocks in Integration Tests
**Choice:** Real DB with transactions

**Why:** Test real behavior, catch integration bugs
**Cost:** Tests slightly slower

---

## References

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Four Rules of Simple Design - Kent Beck](https://martinfowler.com/bliki/BeckDesignRules.html)
- [SOLID Principles - Wikipedia](https://en.wikipedia.org/wiki/SOLID)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

**Last Updated:** 2025-01-10

**The code is the truth.** When docs and code disagree, code wins. Keep docs short. Keep code clean.
