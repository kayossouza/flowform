# Flowform Development Guide

Fast setup. TDD workflow. Quality checks. That's all you need.

---

## Quick Setup

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm@9`)
- Docker & Docker Compose
- OpenAI or Anthropic API key

### Install
```bash
git clone https://github.com/kayossouza/flowform.git
cd flowform
pnpm install
cp .env.example .env
# Add your API key to .env

pnpm db:up
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Verify
```bash
pnpm check  # type-check + lint + test
```

All green? You're ready.

---

## Daily Workflow

### Morning
```bash
git pull origin main
pnpm install          # If package.json changed
pnpm db:up
pnpm db:migrate       # If migrations added
pnpm dev
```

### During Development
```bash
# Watch tests for package you're working on
pnpm --filter @repo/core test:watch

# Type-check
pnpm type-check

# Lint and fix
pnpm lint:fix
```

### Before Committing
```bash
pnpm check  # MUST pass
```

---

## TDD: RED → GREEN → REFACTOR

**Every line of code starts with a failing test.**

### 1. RED - Write Failing Test
```typescript
it('extracts email from message', () => {
  const result = extractEmail('My email is user@example.com');
  expect(result).toBe('user@example.com');
});
// Run: ❌ FAIL - extractEmail not defined
```

### 2. GREEN - Make It Pass
```typescript
export function extractEmail(message: string): string | null {
  const match = message.match(/\S+@\S+/);
  return match ? match[0] : null;
}
// Run: ✅ PASS
```

### 3. REFACTOR - Clean Up
```typescript
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function extractEmail(message: string): string | null {
  const match = message.match(EMAIL_REGEX);
  return match ? match[0] : null;
}
// Run: ✅ PASS (behavior unchanged, code better)
```

### 4. REPEAT
Add next test. Go back to RED.

**Rules:**
- No production code without failing test first
- Test must actually fail (not pass immediately)
- Only refactor when tests are green

---

## Code Style

### Functions
**≤60 lines. Do one thing.**

```typescript
// ✅ Good: Small, focused
function validateEmail(value: string): ValidationResult {
  if (!value) return { valid: false, error: 'Required' };
  if (!EMAIL_REGEX.test(value)) return { valid: false, error: 'Invalid' };
  return { valid: true };
}

// ❌ Bad: Too long, multiple concerns
function processForm(form: any) {
  // 100 lines of validation, parsing, saving, emailing...
}
```

### Names
**Reveal intent. Be specific.**

```typescript
// ✅ Good
function validateEmailAddress(value: string): ValidationResult { }
const userEmailAddress = getUserInput();

// ❌ Bad
function validate(v: any) { }
const tmp = getData();
```

### Types
**Explicit return types. No `any`.**

```typescript
// ✅ Good
function parseResponse(data: string): ParsedData {
  // ...
}

// ❌ Bad
function parse(data) {  // Implicit any
  // ...
}
```

### Comments
**Explain WHY, not WHAT.**

```typescript
// ✅ Good: Explains why
// Use naive regex here instead of full RFC 5322
// because most users can't handle complex addresses anyway
const EMAIL_REGEX = /\S+@\S+\.\S+/;

// ❌ Bad: Explains what (obvious from code)
// Create regex for email
const EMAIL_REGEX = /\S+@\S+\.\S+/;
```

---

## Testing

### Structure
```typescript
describe('Feature or module', () => {
  describe('success cases', () => {
    it('does X when Y', () => {
      // Arrange
      const input = createInput();

      // Act
      const result = function(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('error cases', () => {
    it('throws ValidationError for invalid input', () => {
      expect(() => function(invalidInput)).toThrow(ValidationError);
    });
  });

  describe('edge cases', () => {
    it('handles null', () => { /* ... */ });
    it('handles empty array', () => { /* ... */ });
  });
});
```

### Coverage Requirements
- Overall: 90%
- packages/core: 95%
- Branches: 85%

```bash
pnpm test:coverage
open coverage/index.html
```

### Integration Tests
**Use real dependencies. No mocks.**

```typescript
describe('POST /api/forms', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`BEGIN`;
  });

  afterEach(async () => {
    await prisma.$executeRaw`ROLLBACK`;
  });

  it('creates form', async () => {
    // Real DB, real API call, no mocks
    const response = await fetch('/api/forms', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    expect(response.status).toBe(201);
  });
});
```

---

## Git Workflow

### Branches
```bash
# Feature
git checkout -b feature/email-validation

# Bug fix
git checkout -b fix/null-pointer

# Docs
git checkout -b docs/update-readme
```

### Commits
[Conventional Commits](https://www.conventionalcommits.org/) enforced by git hook.

```bash
git commit -m "feat(core): add email validation

Implements validateEmail using RFC 5322 regex.
Handles null, undefined, empty strings.

Closes #42"
```

Hook validates:
- Type (feat, fix, docs, etc.)
- Description (min 10 chars)
- Format

### Pull Requests
1. **Create PR** - Use template
2. **CI checks** - Must pass
3. **Code review** - Address feedback
4. **Merge** - Squash and merge

---

## Common Commands

### Development
```bash
pnpm dev                    # Start all apps
pnpm dev --filter=@repo/web # Start specific app
```

### Testing
```bash
pnpm test                   # Run all tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage report
```

### Quality
```bash
pnpm check                  # type-check + lint + test
pnpm type-check             # TypeScript only
pnpm lint                   # ESLint only
pnpm lint:fix               # Auto-fix linting
pnpm format                 # Format with Prettier
```

### Building
```bash
pnpm build                  # Build all packages
pnpm build --filter=@repo/core # Build specific package
pnpm clean                  # Remove build artifacts
```

### Database
```bash
pnpm db:up                  # Start Postgres
pnpm db:down                # Stop Postgres
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed data
pnpm db:studio              # Open Prisma Studio
```

---

## Troubleshooting

### Tests Failing Locally
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
pnpm test
```

### Type Errors
```bash
# Check specific package
pnpm --filter @repo/core type-check

# Rebuild type declarations
pnpm build --filter=@repo/core
```

### Database Issues
```bash
# Reset database
pnpm db:down
docker volume rm flowform_postgres_data
pnpm db:up
pnpm db:migrate
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port
PORT=3001 pnpm dev
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Cold build | <10 min |
| Incremental build | <1 min |
| Hot reload | <2 sec |
| Test suite | <5 min |
| Type-check | <2 min |

---

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Design decisions
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guide
- [READING.md](./READING.md) - Required reading

---

**Last Updated:** 2025-01-10

**Write tests. Keep functions small. Ship it.** That's the workflow.
