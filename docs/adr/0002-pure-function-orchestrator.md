# ADR-0002: Orchestrator as Pure Function

## Status
Accepted

## Context

The orchestrator is the heart of Flowform. It:
- Takes user input
- Calls LLM to continue conversation
- Extracts structured data from responses
- Determines when form is complete

This is the most critical component and must be:
- **100% testable** - No untested paths
- **Deterministic** - Same inputs → same outputs (given same LLM response)
- **Fast** - No slow I/O in hot path
- **Portable** - Run anywhere (CLI, mobile, edge, lambda)

## Decision

The orchestrator is implemented as a **pure function** with **dependency injection**:

```typescript
async function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient  // Injected dependency
): Promise<OrchestratorResult>
```

**Purity guarantees**:
1. **No side effects**: No database writes, no API calls, no logging, no file I/O
2. **No global state**: Doesn't read from `process.env`, global variables, singletons
3. **Deterministic**: Same inputs → same outputs (modulo LLM non-determinism)
4. **Explicit dependencies**: All dependencies passed as arguments

**What the orchestrator does**:
- Validate form definition
- Build LLM prompt
- Call LLM (via injected client)
- Parse LLM response
- Extract fields
- Determine completion status
- Return result

**What the orchestrator does NOT do**:
- Database operations (save session, save submission)
- Logging (caller logs)
- API calls (LLM client handles that)
- Webhook delivery
- Analytics tracking

## Alternatives Considered

### 1. Orchestrator as Class with Dependencies Injected via Constructor
```typescript
class Orchestrator {
  constructor(
    private llmClient: LlmClient,
    private logger: Logger,
    private database: Database
  ) {}

  async run(form, session, message) { }
}
```

**Rejected because**:
- Stateful (must manage instance lifecycle)
- More complex to test (must instantiate class)
- Encourages mixing concerns (why does orchestrator have database?)
- Classes encourage holding state (which we don't need)

### 2. Orchestrator as Service with Global Dependencies
```typescript
// orchestratorService.ts
import { llmClient } from './clients/llm';
import { database } from './database';

export async function runLlmStep(form, session, message) {
  // Uses global singletons
}
```

**Rejected because**:
- Global dependencies are impossible to test properly
- Can't run multiple configurations in same process
- Hard to swap implementations (e.g., mock for testing)
- Violates dependency inversion principle

### 3. Orchestrator with All Side Effects Built-In
```typescript
async function runLlmStep(form, session, message) {
  const llm = new OpenAIClient(process.env.OPENAI_KEY);
  const response = await llm.complete(messages);
  await database.save(session);
  await logger.log('Processed message');
  await webhooks.send(result);
  return result;
}
```

**Rejected because**:
- Impossible to test without real database, LLM, webhooks
- Slow (I/O in every call)
- Tightly coupled to specific implementations
- Can't reuse orchestrator logic in different contexts

## Consequences

### Positive
- **100% Testable**: Mock `LlmClient`, test all paths with zero I/O
- **Fast Tests**: No database, no API calls → tests run in milliseconds
- **Portable**: Run in CLI, mobile, edge functions, anywhere
- **Predictable**: No hidden side effects or global state
- **Parallel Tests**: No shared state → run tests in parallel safely
- **Easy to Reason About**: Input → Output, no surprises
- **Dependency Inversion**: Orchestrator depends on interface, not concrete LLM client

### Negative
- **Caller Complexity**: Caller must inject dependencies and handle side effects
- **Multiple Steps**: Multi-step workflows require caller to orchestrate
- **Learning Curve**: Contributors must understand functional programming concepts

### Neutral
- **More Explicit**: Caller explicitly handles database, logging, webhooks (good for transparency, bad for convenience)
- **Verbose**: More parameters passed to function (clear but wordy)

## Implementation Example

**Pure orchestrator (packages/core)**:
```typescript
export async function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient
): Promise<OrchestratorResult> {
  // 1. Build prompt
  const messages = buildLlmPrompt(form, session, userMessage);

  // 2. Call LLM
  const response = await llmClient.complete(messages);

  // 3. Parse response
  const parsed = parseResponse(response);

  // 4. Extract fields
  const extracted = extractFields(parsed, form);

  // 5. Determine completion
  const isComplete = checkCompletion(form, extracted);

  return {
    botMessage: parsed.message,
    extractedFields: extracted,
    isComplete
  };
}
```

**Caller handles side effects (apps/web)**:
```typescript
// API route handler
export async function POST(req: Request) {
  const { formId, sessionId, message } = await req.json();

  // 1. Fetch dependencies (side effects)
  const form = await database.getForm(formId);
  const session = await database.getSession(sessionId);
  const llmClient = createLlmClient(env.LLM_PROVIDER);

  // 2. Call pure orchestrator
  const result = await runLlmStep(form, session, message, llmClient);

  // 3. Handle side effects
  await database.saveSession(sessionId, result);
  logger.info('Processed message', { formId, sessionId });

  if (result.isComplete) {
    await webhooks.send(form.webhookUrl, result.extractedFields);
  }

  return Response.json(result);
}
```

## Testing Example

**Before** (with side effects):
```typescript
// Hard to test - requires mocking database, LLM, logger
test('orchestrator extracts email', async () => {
  mockDatabase.getForm.mockResolvedValue(form);
  mockLlm.complete.mockResolvedValue(response);
  mockLogger.info.mockImplementation(() => {});

  await runLlmStep(formId, sessionId, message);

  expect(mockDatabase.saveSession).toHaveBeenCalledWith(...);
});
```

**After** (pure function):
```typescript
// Easy to test - just pass mock LLM client
test('orchestrator extracts email', async () => {
  const mockLlm: LlmClient = {
    complete: async () => ({
      message: 'Great! What\'s your email?',
      extractedFields: { email: 'user@example.com' }
    })
  };

  const result = await runLlmStep(form, session, message, mockLlm);

  expect(result.extractedFields.email).toBe('user@example.com');
});
```

## References

- [Functional Core, Imperative Shell](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)
- [Pure Functions](https://en.wikipedia.org/wiki/Pure_function)

## Date
2025-01-10

## Author
@kayossouza
