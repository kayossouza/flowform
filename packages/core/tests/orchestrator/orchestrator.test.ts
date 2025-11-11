import { describe, it, expect } from 'vitest';
import {
  determineNextField,
  buildSystemPrompt,
  runLlmStep,
} from '../../src/orchestrator';
import type {
  FormDefinition,
  Session,
  LlmClient,
  LlmMessage,
} from '../../src/types';
import { FieldType, SessionStatus, TurnRole } from '../../src/types';

describe('determineNextField', () => {
  it('should return first required field when no fields collected', () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Contact Form',
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
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const result = determineNextField(form, session);
    expect(result).toBe('name');
  });

  it('should return next required field after first is collected', () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Contact Form',
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
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [
        {
          fieldId: 'name',
          value: 'John Doe',
          collectedAt: new Date(),
        },
      ],
      startedAt: new Date(),
    };

    const result = determineNextField(form, session);
    expect(result).toBe('email');
  });

  it('should return null when all required fields collected', () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Contact Form',
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
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [
        {
          fieldId: 'name',
          value: 'John Doe',
          collectedAt: new Date(),
        },
        {
          fieldId: 'email',
          value: 'john@example.com',
          collectedAt: new Date(),
        },
      ],
      startedAt: new Date(),
    };

    const result = determineNextField(form, session);
    expect(result).toBeNull();
  });
});

describe('buildSystemPrompt', () => {
  it('should build prompt with form context and collected fields', () => {
    const form: FormDefinition = {
      id: 'form1',
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
          description: 'User full name',
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 1,
          description: 'User email address',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [
        {
          fieldId: 'name',
          value: 'John Doe',
          collectedAt: new Date(),
        },
      ],
      startedAt: new Date(),
    };

    const prompt = buildSystemPrompt(form, session);

    // Verify prompt contains key sections
    expect(prompt).toContain('Contact Form');
    expect(prompt).toContain('Full Name');
    expect(prompt).toContain('Email');
    expect(prompt).toContain('John Doe'); // Already collected
    expect(prompt).toContain('JSON');
  });

  it('should include all form fields in prompt', () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Survey',
      fields: [
        {
          id: 'q1',
          name: 'question1',
          label: 'Question 1',
          type: FieldType.TEXT,
          required: true,
          order: 0,
        },
        {
          id: 'q2',
          name: 'question2',
          label: 'Question 2',
          type: FieldType.TEXT,
          required: false,
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const prompt = buildSystemPrompt(form, session);

    expect(prompt).toContain('question1');
    expect(prompt).toContain('question2');
    expect(prompt).toContain('required');
  });
});

describe('runLlmStep - Integration Test (User Story 1)', () => {
  it('should extract fields from user message and determine completion', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Contact Form',
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
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: JSON.stringify({
          botResponse: 'Thanks! What is your email?',
          extractedFields: { name: 'John Doe' },
        }),
      }),
    };

    const result = await runLlmStep(
      form,
      session,
      'My name is John Doe',
      mockLlmClient
    );

    expect(result.botResponse).toBe('Thanks! What is your email?');
    expect(result.extractedFields).toEqual({ name: 'John Doe' });
    expect(result.isComplete).toBe(false);
    expect(result.nextField).toBe('email');
  });

  it('should mark form complete when all required fields collected', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Contact Form',
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
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [
        {
          fieldId: 'name',
          value: 'John Doe',
          collectedAt: new Date(),
        },
      ],
      startedAt: new Date(),
    };

    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: JSON.stringify({
          botResponse: 'Perfect! I have all your information.',
          extractedFields: { email: 'john@example.com' },
        }),
      }),
    };

    const result = await runLlmStep(
      form,
      session,
      'My email is john@example.com',
      mockLlmClient
    );

    expect(result.botResponse).toBe('Perfect! I have all your information.');
    expect(result.extractedFields).toEqual({ email: 'john@example.com' });
    expect(result.isComplete).toBe(true);
    expect(result.nextField).toBeUndefined();
  });

  it('should throw ClientError for invalid LLM JSON response', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Contact Form',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: FieldType.TEXT,
          required: true,
          order: 0,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: 'This is not valid JSON',
      }),
    };

    await expect(
      runLlmStep(form, session, 'My name is John', mockLlmClient)
    ).rejects.toThrow('LLM returned invalid JSON');
  });

  it('should throw ClientError for unknown field in extracted data', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Contact Form',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: FieldType.TEXT,
          required: true,
          order: 0,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: JSON.stringify({
          botResponse: 'Thanks!',
          extractedFields: { unknownField: 'value' },
        }),
      }),
    };

    await expect(
      runLlmStep(form, session, 'My name is John', mockLlmClient)
    ).rejects.toThrow('Field not in form definition');
  });

  it('should reject invalid field values during extraction', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Registration Form',
      fields: [
        {
          id: 'email',
          name: 'email',
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 0,
        },
        {
          id: 'age',
          name: 'age',
          label: 'Age',
          type: FieldType.NUMBER,
          required: true,
          validation: { min: 18, max: 120 },
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    // Mock LLM returns invalid email
    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: JSON.stringify({
          botResponse: "Got it! What's your age?",
          extractedFields: { email: 'not-an-email' },
        }),
      }),
    };

    await expect(
      runLlmStep(
        form,
        session,
        'My email is not-an-email',
        mockLlmClient
      )
    ).rejects.toThrow('Invalid email format');
  });

  it('should reject number out of range', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Registration Form',
      fields: [
        {
          id: 'age',
          name: 'age',
          label: 'Age',
          type: FieldType.NUMBER,
          required: true,
          validation: { min: 18, max: 120 },
          order: 0,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: JSON.stringify({
          botResponse: 'Thanks!',
          extractedFields: { age: 15 },
        }),
      }),
    };

    await expect(
      runLlmStep(form, session, 'I am 15 years old', mockLlmClient)
    ).rejects.toThrow('Number must be at least 18');
  });

  it('should reject invalid enum value', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Survey Form',
      fields: [
        {
          id: 'size',
          name: 'size',
          label: 'T-Shirt Size',
          type: FieldType.ENUM,
          required: true,
          validation: { options: ['S', 'M', 'L', 'XL'] },
          order: 0,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const mockLlmClient: LlmClient = {
      complete: async () => ({
        content: JSON.stringify({
          botResponse: 'Thanks!',
          extractedFields: { size: 'XXL' },
        }),
      }),
    };

    await expect(
      runLlmStep(form, session, 'Size XXL please', mockLlmClient)
    ).rejects.toThrow('Value must be one of: S, M, L, XL');
  });

  it('should include conversation history in LLM messages', async () => {
    const form: FormDefinition = {
      id: 'form1',
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

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [
        {
          role: TurnRole.USER,
          content: 'My name is John',
          timestamp: new Date(),
        },
        {
          role: TurnRole.ASSISTANT,
          content: 'Thanks John! What is your email?',
          timestamp: new Date(),
        },
      ],
      fields: [
        {
          fieldId: 'name',
          value: 'John',
          collectedAt: new Date(),
        },
      ],
      startedAt: new Date(),
    };

    let capturedMessages: LlmMessage[] = [];

    const mockLlmClient: LlmClient = {
      complete: async (messages) => {
        capturedMessages = messages;
        return {
          content: JSON.stringify({
            botResponse: 'Perfect! All done.',
            extractedFields: { email: 'john@example.com' },
          }),
        };
      },
    };

    await runLlmStep(
      form,
      session,
      'john@example.com',
      mockLlmClient
    );

    // Verify conversation history is included
    expect(capturedMessages.length).toBeGreaterThan(2);

    // Should have system message
    expect(capturedMessages[0]?.role).toBe('system');

    // Should have previous user message
    const userMessage1 = capturedMessages.find(
      (m) => m.role === 'user' && m.content === 'My name is John'
    );
    expect(userMessage1).toBeDefined();
    expect(userMessage1?.role).toBe('user');

    // Should have previous assistant message
    const assistantMessage = capturedMessages.find(
      (m) => m.role === 'assistant' && m.content.includes('Thanks John')
    );
    expect(assistantMessage).toBeDefined();
    expect(assistantMessage?.role).toBe('assistant');

    // Should have current user message
    const userMessage2 = capturedMessages.find(
      (m) => m.role === 'user' && m.content === 'john@example.com'
    );
    expect(userMessage2).toBeDefined();
    expect(userMessage2?.role).toBe('user');
  });

  it('should use context from previous turns to maintain conversation flow', async () => {
    const form: FormDefinition = {
      id: 'form1',
      name: 'Registration',
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

    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [
        {
          role: TurnRole.USER,
          content: 'I prefer to be called Alex',
          timestamp: new Date(),
        },
        {
          role: TurnRole.ASSISTANT,
          content: 'Got it Alex! What is your full name?',
          timestamp: new Date(),
        },
      ],
      fields: [],
      startedAt: new Date(),
    };

    const mockLlmClient: LlmClient = {
      complete: async (messages) => {
        // LLM should have access to context showing user prefers "Alex"
        const hasContext = messages.some(
          (m) => m.content.includes('prefer to be called Alex')
        );
        expect(hasContext).toBe(true);

        return {
          content: JSON.stringify({
            botResponse: 'Thanks Alex! What is your email?',
            extractedFields: { name: 'Alexander Smith' },
          }),
        };
      },
    };

    const result = await runLlmStep(
      form,
      session,
      'Alexander Smith',
      mockLlmClient
    );

    expect(result.extractedFields).toEqual({ name: 'Alexander Smith' });
  });
});

describe('Edge Cases', () => {
  describe('Empty Forms', () => {
    it('should handle form with no fields', async () => {
      const emptyForm: FormDefinition = {
        id: 'empty-form',
        name: 'Empty Form',
        fields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'empty-form',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: JSON.stringify({
            botResponse: 'Form is complete!',
            extractedFields: {},
          }),
        }),
      };

      const result = await runLlmStep(
        emptyForm,
        session,
        'Hello',
        mockLlmClient
      );

      expect(result.isComplete).toBe(true);
      expect(result.nextField).toBeUndefined();
      expect(result.extractedFields).toEqual({});
    });

    it('should handle form with only optional fields', async () => {
      const optionalForm: FormDefinition = {
        id: 'optional-form',
        name: 'Optional Fields Form',
        fields: [
          {
            id: 'notes',
            name: 'notes',
            label: 'Notes',
            type: FieldType.TEXT,
            required: false,
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'optional-form',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: JSON.stringify({
            botResponse: 'All done!',
            extractedFields: {},
          }),
        }),
      };

      const result = await runLlmStep(
        optionalForm,
        session,
        'No notes',
        mockLlmClient
      );

      expect(result.isComplete).toBe(true);
      expect(result.nextField).toBeUndefined();
    });
  });

  describe('Null and Undefined Values', () => {
    it('should handle empty user message', async () => {
      const form: FormDefinition = {
        id: 'form1',
        name: 'Test Form',
        fields: [
          {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'form1',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: JSON.stringify({
            botResponse: 'What is your name?',
            extractedFields: {},
          }),
        }),
      };

      const result = await runLlmStep(form, session, '', mockLlmClient);

      expect(result.botResponse).toBe('What is your name?');
      expect(result.extractedFields).toEqual({});
    });

    it('should handle session with empty turns array', async () => {
      const form: FormDefinition = {
        id: 'form1',
        name: 'Test Form',
        fields: [
          {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'form1',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: JSON.stringify({
            botResponse: 'Hi! What is your name?',
            extractedFields: {},
          }),
        }),
      };

      const result = await runLlmStep(
        form,
        session,
        'Hello',
        mockLlmClient
      );

      expect(result.botResponse).toBe('Hi! What is your name?');
    });

    it('should handle session with empty fields array', async () => {
      const form: FormDefinition = {
        id: 'form1',
        name: 'Test Form',
        fields: [
          {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'form1',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: JSON.stringify({
            botResponse: 'Got it!',
            extractedFields: { name: 'John' },
          }),
        }),
      };

      const result = await runLlmStep(form, session, 'John', mockLlmClient);

      expect(result.extractedFields).toEqual({ name: 'John' });
      expect(result.isComplete).toBe(true);
    });
  });

  describe('Malformed Responses', () => {
    it('should throw ClientError for fields not in form definition', async () => {
      const form: FormDefinition = {
        id: 'form1',
        name: 'Test Form',
        fields: [
          {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'form1',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: JSON.stringify({
            botResponse: 'Thanks!',
            extractedFields: { unknownField: 'value' },
          }),
        }),
      };

      await expect(
        runLlmStep(form, session, 'Test', mockLlmClient)
      ).rejects.toThrow('Field not in form definition');
    });

    it('should throw ClientError for malformed JSON response', async () => {
      const form: FormDefinition = {
        id: 'form1',
        name: 'Test Form',
        fields: [
          {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'form1',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: 'Not valid JSON at all',
        }),
      };

      await expect(
        runLlmStep(form, session, 'Test', mockLlmClient)
      ).rejects.toThrow('LLM returned invalid JSON');
    });

    it('should throw ClientError for response missing required fields', async () => {
      const form: FormDefinition = {
        id: 'form1',
        name: 'Test Form',
        fields: [
          {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        id: 'session1',
        formId: 'form1',
        status: SessionStatus.ACTIVE,
        turns: [],
        fields: [],
        startedAt: new Date(),
      };

      const mockLlmClient: LlmClient = {
        complete: async () => ({
          content: JSON.stringify({
            botResponse: 'Missing extractedFields!',
          }),
        }),
      };

      await expect(
        runLlmStep(form, session, 'Test', mockLlmClient)
      ).rejects.toThrow('LLM response missing required fields');
    });
  });
});
