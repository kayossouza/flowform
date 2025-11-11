# Contributing to Flowform

Open-source infrastructure for AI-powered conversational forms. Every contribution counts.

---

## Quick Start

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/flowform.git
cd flowform
pnpm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Add your OpenAI or Anthropic API key to .env

pnpm db:up
pnpm db:migrate
pnpm dev
```

### 3. Verify Setup
```bash
pnpm check  # Should pass: type-check + lint + test
```

---

## Making Changes

### Create a Branch
```bash
git checkout -b feature/your-feature-name
# or: fix/bug-description, docs/*, refactor/*, test/*
```

### Write Code

**Follow these principles:**
- Write tests first (TDD)
- Keep functions ≤60 lines
- Keep files ≤350 lines
- No `any` types
- Use logger, not `console.log`

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed workflow.

### The Boy Scout Rule

**"Always leave the code cleaner than you found it."**

When you touch a file:
- Fix code smells you see
- Improve unclear names
- Extract long functions
- Add missing tests
- Document unclear behavior

If every contributor makes code 1% better, we'll have a world-class codebase.

### Commit Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(core): add email validation

Implements validateEmail with RFC 5322 regex.
Handles null, undefined, empty strings.

Closes #42"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Tooling, dependencies

Git hooks will validate your commit message format automatically.

### Push & Create PR

```bash
git push origin feature/your-feature-name
```

Open a PR on GitHub. Use the template. Answer all questions.

---

## What Professionals Do

Don't need a pledge. Just do this:

1. **Write tests first** - RED → GREEN → REFACTOR
2. **Keep functions small** - One thing, well
3. **Name things clearly** - No abbreviations
4. **Leave it cleaner** - Boy Scout Rule
5. **Ship it working** - Tests prove it works

That's it. Quality is a habit, not a rule.

---

## Code Review Standards

Reviewers check:
1. **Does it work?** (tests pass)
2. **Is it clean?** (easy to read)
3. **Is it simple?** (no unnecessary complexity)
4. **Does it fit?** (follows architecture)

We reject PRs that fail these standards. Not personal - it's craftsmanship.

---

## Code Style

### TypeScript
```typescript
// ✅ Good
function validateEmail(value: string): ValidationResult {
  if (!EMAIL_REGEX.test(value)) {
    return { valid: false, error: 'Invalid email' };
  }
  return { valid: true };
}

// ❌ Bad
function valEm(v: any) { /* ... */ }
```

### Testing
```typescript
describe('validateEmail', () => {
  it('accepts valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = validateEmail('not-an-email');
    expect(result.valid).toBe(false);
  });
});
```

### Error Handling
```typescript
// ✅ Good: Specific errors
throw new ValidationError(
  'Invalid email format',
  'INVALID_EMAIL',
  { value }
);

// ❌ Bad: Generic errors
throw new Error('Something went wrong');
```

---

## Architecture

Flowform uses Clean Architecture:

```
Domain (packages/core) - Pure TypeScript, zero dependencies
  ↑
Infrastructure (packages/llm) - LLM clients
  ↑
Application (apps/web/lib) - API routes, DB queries
  ↑
Presentation (apps/web/app) - UI components
```

**Rule:** Dependencies point inward only. Domain depends on nothing.

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for design decisions.

---

## Getting Help

- **Questions:** [GitHub Discussions](https://github.com/kayossouza/flowform/discussions)
- **Bugs:** [GitHub Issues](https://github.com/kayossouza/flowform/issues)
- **First time?** Look for [`good first issue`](https://github.com/kayossouza/flowform/labels/good%20first%20issue) label

---

## Required Reading

Before contributing to core packages, read:
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) (chapters 2-3)
- [Test Driven Development](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

Full reading list: [docs/READING.md](./docs/READING.md)

---

## Recognition

Top contributors (most impactful, not most commits) may be invited to the core team.

---

## Code of Conduct

Be kind. Be respectful. Be constructive.

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for details.

---

**Thank you for contributing.** Check out [good first issues](https://github.com/kayossouza/flowform/labels/good%20first%20issue) to get started.
