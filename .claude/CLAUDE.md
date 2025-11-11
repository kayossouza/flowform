# Claude Code Instructions for Flowform

These instructions override global settings. Follow them exactly.

---

## Prime Directive

**The code must WORK.**

All the clean code in the world is worthless if it doesn't work.

Tests prove it works. If you don't have tests, you don't know if it works.
If you don't know if it works, you're not a professional.

---

## Read First

Before any code changes:
1. `docs/PROJECT_SPEC.md` - Requirements
2. `docs/ARCHITECTURE.md` - Design patterns
3. `docs/TASKS_MVP.md` - Current work
4. `docs/DEVELOPMENT.md` - Workflow

---

## Architecture Rules (CRITICAL)

### Dependency Flow
```
packages/core      → NO dependencies (not even logging!)
packages/llm       → Can import: core
apps/web           → Can import: core, llm
```

**Violation = Immediate refactor required.**

### The Orchestrator is Pure

```typescript
async function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient  // Injected!
): Promise<OrchestratorResult>
```

**Pure means:**
- No side effects (no DB, no API, no logging)
- No global state
- Same inputs → same outputs
- 100% testable

**Violation = Redesign required.**

---

## TDD: NON-NEGOTIABLE

**Every line of production code MUST have a failing test first.**

```
RED → GREEN → REFACTOR → repeat
```

1. **RED**: Write test that fails
2. **GREEN**: Make it pass (minimal code)
3. **REFACTOR**: Clean up while tests stay green
4. **REPEAT**: Add next test

**No exceptions. Ever.**

---

## Code Quality (Enforced)

### Hard Limits
- Functions: ≤60 lines
- Files: ≤350 lines
- Cyclomatic complexity: ≤12
- Coverage: ≥90% (core: ≥95%)
- Zero `any` types
- No `console.log` (use logger)

### SOLID Principles
**Must follow all five:**

1. **Single Responsibility** - One reason to change
2. **Open/Closed** - Open for extension, closed for modification
3. **Liskov Substitution** - Subtypes are substitutable
4. **Interface Segregation** - Clients don't depend on unused methods
5. **Dependency Inversion** - Depend on abstractions

See ARCHITECTURE.md for examples.

### Four Rules of Simple Design
**In this order:**

1. Passes all tests
2. Reveals intention
3. No duplication
4. Fewest elements

---

## Error Handling

### 1. Validation Errors (User's Fault)
Return result. Don't throw.

```typescript
return { valid: false, error: 'Invalid email' };
```

### 2. Client Errors (Caller's Fault)
Throw with context. Don't retry.

```typescript
throw new ClientError('API key required', 401, 'MISSING_API_KEY');
```

### 3. Server Errors (System's Fault)
Throw with context. Retry with backoff.

```typescript
throw new ServerError('Database failed', 500, originalError);
```

### 4. Bugs (Programmer's Fault)
Let it crash. Fix it. Don't catch.

---

## What Professionals Do

1. **Write tests first** - RED → GREEN → REFACTOR
2. **Keep functions small** - ≤60 lines, one thing
3. **Name things clearly** - No abbreviations
4. **Leave it cleaner** - Boy Scout Rule
5. **Ship it working** - Tests prove it

---

## Before Committing

```bash
pnpm check  # MUST pass
```

This runs:
- Type-check (zero errors)
- Lint (zero warnings)
- Test (all pass, 90%+ coverage)

**If it doesn't pass, fix it. Don't commit.**

---

## Git Hooks

### Pre-Commit
- Lint staged files
- Format staged files
- Test related files
- Validate commit message

### Pre-Push
- Type-check entire project
- Run full test suite

**Hooks enforce quality. Don't skip them.**

---

## Spec Kit Workflow (New Features)

Use for significant features:

1. `/speckit.constitution` - Establish principles
2. `/speckit.specify` - Define what to build
3. `/speckit.clarify` - Resolve ambiguities (optional)
4. `/speckit.plan` - Implementation plan
5. `/speckit.analyze` - Validate coherence (optional)
6. `/speckit.tasks` - Break into tasks
7. `/speckit.implement` - Execute with TDD

---

## Common Violations

### ❌ Wrong: Tight Coupling
```typescript
import { OpenAIClient } from './openai';
const client = new OpenAIClient();
```

### ✅ Right: Dependency Injection
```typescript
function runOrchestrator(client: LlmClient) {
  // ...
}
```

---

### ❌ Wrong: Code Before Test
```typescript
// Wrote validateEmail first
export function validateEmail(value: string) { }
```

### ✅ Right: Test First
```typescript
// Wrote test first, saw it fail, then implemented
it('validates email', () => {
  expect(validateEmail('user@example.com').valid).toBe(true);
});
```

---

### ❌ Wrong: Long Function
```typescript
function processForm(form: any) {
  // 100 lines of mixed concerns
}
```

### ✅ Right: Small Functions
```typescript
function processForm(form: Form): ProcessResult {
  validateForm(form);           // 10 lines
  const parsed = parseForm(form); // 15 lines
  const saved = saveForm(parsed); // 8 lines
  notifySubmission(saved);       // 5 lines
  return { success: true };
}
```

---

### ❌ Wrong: Generic Error
```typescript
throw new Error('Something went wrong');
```

### ✅ Right: Specific Error
```typescript
throw new ValidationError(
  'Invalid email format',
  'INVALID_EMAIL',
  { value, expected: EMAIL_REGEX }
);
```

---

## TypeScript Standards

```typescript
// ✅ Good
function validateEmail(value: string): ValidationResult {
  if (!EMAIL_REGEX.test(value)) {
    return { valid: false, error: 'Invalid email' };
  }
  return { valid: true };
}

// ❌ Bad
function validate(v: any) {  // No any, no implicit return
  // ...
}
```

---

## References

All details are in these docs (don't duplicate here):

- [PROJECT_SPEC.md](../docs/PROJECT_SPEC.md)
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [DEVELOPMENT.md](../docs/DEVELOPMENT.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [READING.md](../docs/READING.md)
- [ADRs](../docs/adr/)

---

## Remember

**Quality is not an act, it's a habit.**

- Write tests first (always)
- Keep functions small (always)
- Name things clearly (always)
- Leave code cleaner (always)
- Ship it working (always)

**No shortcuts. No excuses. No exceptions.**

---

**Last Updated:** 2025-01-10
