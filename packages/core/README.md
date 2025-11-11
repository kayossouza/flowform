# @flowform/core

Pure function orchestrator for conversational form collection powered by LLMs.

## Features

- Zero runtime dependencies
- Full TypeScript strict mode
- Pure functions with dependency injection
- Framework-agnostic (React, Vue, Node.js, edge functions)
- LLM-agnostic (OpenAI, Anthropic, custom providers)

## Installation

```bash
pnpm add @flowform/core
```

## Quick Start

```typescript
import {
  runLlmStep,
  type FormDefinition,
  type Session,
  type LlmClient,
  FieldType,
  SessionStatus,
} from '@flowform/core';

// Define form schema
const contactForm: FormDefinition = {
  id: 'contact-form',
  name: 'Contact Form',
  description: 'Collect user contact information',
  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'Full Name',
      type: FieldType.TEXT,
      required: true,
      order: 0,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: FieldType.EMAIL,
      required: true,
      order: 1,
    },
    {
      id: 'phone',
      name: 'phone',
      label: 'Phone Number',
      type: FieldType.PHONE,
      required: false,
      order: 2,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Initialize session
const session: Session = {
  id: 'session-123',
  formId: 'contact-form',
  status: SessionStatus.ACTIVE,
  turns: [],
  fields: [],
  startedAt: new Date(),
};

// Implement LLM client
const llmClient: LlmClient = {
  async complete(messages) {
    const response = await yourLlmProvider.complete(messages);
    return { content: response };
  },
};

// Process user input
const result = await runLlmStep(
  contactForm,
  session,
  'My name is John Doe and my email is john@example.com',
  llmClient
);

console.log(result.botResponse); // "Thanks John! What's your phone number?"
console.log(result.extractedFields); // { name: "John Doe", email: "john@example.com" }
console.log(result.isComplete); // false
console.log(result.nextField); // "phone"
```

## Core Concepts

### Form Definition

Define your form structure with typed fields:

```typescript
import { type FormDefinition, FieldType } from '@flowform/core';

const form: FormDefinition = {
  id: 'survey',
  name: 'User Survey',
  description: 'Annual user satisfaction survey',
  fields: [
    {
      id: 'age',
      name: 'age',
      label: 'Age',
      type: FieldType.NUMBER,
      required: true,
      order: 0,
      validation: { min: 18, max: 120 },
    },
    {
      id: 'feedback',
      name: 'feedback',
      label: 'Feedback',
      type: FieldType.LONG_TEXT,
      required: true,
      order: 1,
    },
    {
      id: 'rating',
      name: 'rating',
      label: 'Rating',
      type: FieldType.ENUM,
      required: true,
      order: 2,
      validation: { options: ['Poor', 'Fair', 'Good', 'Excellent'] },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Session Management

Track conversation state across turns:

```typescript
import { type Session, SessionStatus, TurnRole } from '@flowform/core';

let session: Session = {
  id: 'unique-session-id',
  formId: 'survey',
  status: SessionStatus.ACTIVE,
  turns: [],
  fields: [],
  startedAt: new Date(),
};

const result = await runLlmStep(form, session, userMessage, llmClient);

session = {
  ...session,
  turns: [
    ...session.turns,
    { role: TurnRole.USER, content: userMessage, timestamp: new Date() },
    { role: TurnRole.ASSISTANT, content: result.botResponse, timestamp: new Date() },
  ],
  fields: [
    ...session.fields,
    ...Object.entries(result.extractedFields).map(([fieldName, value]) => ({
      fieldId: form.fields.find(f => f.name === fieldName)!.id,
      value,
      collectedAt: new Date(),
    })),
  ],
};

if (result.isComplete) {
  session.status = SessionStatus.COMPLETED;
  session.completedAt = new Date();
}
```

### Field Types

Supported field types with automatic validation:

- **TEXT**: Short text input
- **LONG_TEXT**: Multi-line text input
- **EMAIL**: Email address with format validation
- **PHONE**: Phone number with format validation (international support)
- **NUMBER**: Numeric input with optional min/max constraints
- **DATE**: Date input with format validation
- **ENUM**: Select from predefined options

### Validation

All field values are automatically validated:

```typescript
import { validateField, validateEmail, validateNumber } from '@flowform/core';

const emailResult = validateEmail('user@example.com');
if (!emailResult.valid) {
  console.error(emailResult.error);
}

const numberResult = validateNumber(25, { min: 18, max: 120 });
console.log(numberResult.valid);

const fieldResult = validateField(formField, value);
```

### Error Handling

The orchestrator throws `ClientError` for validation failures and invalid inputs:

```typescript
import { runLlmStep, ClientError } from '@flowform/core';

try {
  const result = await runLlmStep(form, session, userMessage, llmClient);
} catch (error) {
  if (error instanceof ClientError) {
    console.error('Client error:', error.message);
    console.error('Error code:', error.code);
    console.error('Details:', error.details);
    console.error('Status:', error.statusCode);
  } else {
    console.error('Server error:', error);
  }
}
```

## Advanced Usage

### Multi-Turn Conversations

The orchestrator maintains conversation context automatically:

```typescript
import { buildConversationHistory } from '@flowform/core';

const session: Session = {
  id: 'session-1',
  formId: 'form-1',
  status: SessionStatus.ACTIVE,
  turns: [
    { role: TurnRole.USER, content: 'My name is Alice', timestamp: new Date() },
    { role: TurnRole.ASSISTANT, content: 'Hi Alice! What\'s your email?', timestamp: new Date() },
    { role: TurnRole.USER, content: 'alice@example.com', timestamp: new Date() },
  ],
  fields: [
    { fieldId: 'name', value: 'Alice', collectedAt: new Date() },
  ],
  startedAt: new Date(),
};

const result = await runLlmStep(form, session, 'What else do you need?', llmClient);
```

### Custom Prompts

Build custom prompts with field context:

```typescript
import { buildFieldContext, buildSystemPrompt } from '@flowform/core';

const fieldContext = buildFieldContext(session);
const systemPrompt = buildSystemPrompt(form, session);
```

### Determining Next Field

```typescript
import { determineNextField } from '@flowform/core';

const nextField = determineNextField(form, session);
```

## Testing

The pure function design makes testing straightforward:

```typescript
import { describe, it, expect } from 'vitest';
import { runLlmStep, type LlmClient } from '@flowform/core';

describe('Form Collection', () => {
  it('should extract email from user message', async () => {
    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: JSON.stringify({
          botResponse: 'Got it! What else?',
          extractedFields: { email: 'test@example.com' },
        }),
      }),
    };

    const result = await runLlmStep(form, session, 'My email is test@example.com', mockLlmClient);

    expect(result.extractedFields.email).toBe('test@example.com');
    expect(result.botResponse).toBe('Got it! What else?');
  });
});
```

## API Reference

### Primary Functions

#### `runLlmStep(form, session, userMessage, llmClient)`

Main orchestrator function that processes one conversational turn.

**Parameters:**
- `form: FormDefinition` - Form schema
- `session: Session` - Current session state
- `userMessage: string` - User's message
- `llmClient: LlmClient` - LLM client implementation

**Returns:** `Promise<OrchestratorResult>`

**Throws:** `ClientError` on validation failures or invalid inputs

### Helper Functions

#### `buildConversationHistory(session)`

Converts session turns to LLM message format.

#### `buildFieldContext(session)`

Formats collected fields as context string.

#### `buildSystemPrompt(form, session)`

Builds complete system prompt with form schema and collected fields.

#### `determineNextField(form, session)`

Returns next required field to collect, or null if complete.

### Validation Functions

#### `validateField(field, value)`

Main validation dispatcher that routes to type-specific validators.

#### `validateEmail(value)`, `validatePhone(value)`, `validateNumber(value, rules)`, `validateDate(value)`, `validateEnum(value, options)`

Type-specific validators for each field type.

## Architecture

Clean Architecture principles:

- Pure functions with no side effects
- Zero external runtime dependencies
- TypeScript strict mode, no `any` types
- Dependency injection for testability
- Framework-agnostic design

## License

MIT

## Contributing

See the main [Flowform repository](https://github.com/yourusername/flowform) for contribution guidelines.
