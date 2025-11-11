# ADR-0001: Use Clean Architecture

## Status
Accepted

## Context

Flowform is building an AI-native conversational forms platform that must be:
- **Testable**: Core logic must be 95%+ tested
- **Portable**: Run in CLI, web, mobile, edge functions
- **Maintainable**: Easy to understand and modify over years
- **Framework-agnostic**: Not tied to Next.js, React, or any specific framework

Traditional layered architectures (Controller → Service → Repository) tend to couple business logic to frameworks, making testing difficult and portability impossible.

**Constraints**:
- TypeScript monorepo
- Open source (many contributors with varying experience)
- Must scale to 10+ applications
- LLM integrations (OpenAI, Anthropic, future providers)

## Decision

We adopt **Clean Architecture** as described by Robert C. Martin, with these layers:

```
External → Infrastructure → Application → Domain
```

**Layer definitions**:

1. **Domain** (`packages/core`)
   - Pure TypeScript
   - Zero dependencies on frameworks or external services
   - Contains: types, validation, orchestration logic
   - Example: `orchestrator.ts`, `validators.ts`

2. **Infrastructure** (`packages/llm`, `packages/database`)
   - Implements interfaces defined by Domain
   - Contains: LLM clients, database adapters
   - Example: `OpenAIClient implements LlmClient`

3. **Application** (`apps/web/lib`)
   - Use cases and application-specific logic
   - Connects Domain and Infrastructure
   - Contains: API route handlers, database queries
   - Example: API routes that call orchestrator with injected dependencies

4. **Presentation** (`apps/web/app`)
   - UI components and pages
   - Depends on Application layer
   - Contains: React components, Next.js pages
   - Example: Form builder UI, submission viewer

**Dependency Rule**: Dependencies point inward only. Domain depends on nothing. Infrastructure depends on Domain (via interfaces).

## Alternatives Considered

### 1. Traditional MVC/Layered Architecture
**Rejected because**:
- Business logic gets coupled to framework
- Testing requires mocking framework dependencies
- Can't run business logic outside the web app

### 2. Hexagonal Architecture (Ports & Adapters)
**Not chosen because**:
- Very similar to Clean Architecture
- Less well-known (harder for contributors to understand)
- Clean Architecture is more explicit about layer names

### 3. Feature-First Structure (Vertical Slices)
**Not chosen because**:
- Works better for established domains
- We need flexibility as requirements evolve
- Harder to share code across features initially

## Consequences

### Positive
- **Testability**: Domain logic is 100% testable with no mocks
- **Portability**: Core logic runs anywhere (CLI, mobile, edge)
- **Flexibility**: Swap frameworks, databases, LLM providers with minimal impact
- **Clarity**: Clear boundaries make code easier to understand
- **Maintainability**: Changes are isolated to specific layers

### Negative
- **Indirection**: More interfaces and abstractions
- **Boilerplate**: Must define interfaces for all external dependencies
- **Learning curve**: New contributors must understand Clean Architecture
- **Initial complexity**: More files and structure upfront

### Neutral
- **Verbosity**: More explicit code (some see as positive, some as negative)
- **File count**: More files due to clear separation (helps with discoverability)

## Implementation Notes

**Enforcement**:
- TypeScript project references enforce build order
- Code review checks for dependency violations
- `.claude/CLAUDE.md` instructs AI to enforce architecture rules

**Key principle**: The orchestrator (`packages/core/orchestrator.ts`) is a **pure function**:
```typescript
function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient // Injected!
): Promise<OrchestratorResult>
```

No side effects. No database calls. No API calls. Pure logic.

## References

- [The Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture Book](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)

## Date
2025-01-10

## Author
@kayossouza
