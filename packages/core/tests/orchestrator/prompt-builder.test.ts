import { describe, it, expect } from 'vitest';
import {
  buildConversationHistory,
  buildFieldContext,
} from '../../src/orchestrator/prompt-builder';
import type { Session, LlmMessage } from '../../src/types';
import { SessionStatus, TurnRole } from '../../src/types';

describe('buildConversationHistory', () => {
  it('should convert session turns to LlmMessage array', () => {
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
        {
          role: TurnRole.USER,
          content: 'john@example.com',
          timestamp: new Date(),
        },
      ],
      fields: [],
      startedAt: new Date(),
    };

    const result = buildConversationHistory(session);

    expect(result).toEqual([
      { role: 'user', content: 'My name is John' },
      { role: 'assistant', content: 'Thanks John! What is your email?' },
      { role: 'user', content: 'john@example.com' },
    ]);
  });

  it('should return empty array for session with no turns', () => {
    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const result = buildConversationHistory(session);

    expect(result).toEqual([]);
  });

  it('should handle single turn', () => {
    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [
        {
          role: TurnRole.USER,
          content: 'Hello',
          timestamp: new Date(),
        },
      ],
      fields: [],
      startedAt: new Date(),
    };

    const result = buildConversationHistory(session);

    expect(result).toEqual([{ role: 'user', content: 'Hello' }]);
  });
});

describe('buildFieldContext', () => {
  it('should format collected fields as context string', () => {
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

    const result = buildFieldContext(session);

    expect(result).toContain('name');
    expect(result).toContain('John Doe');
    expect(result).toContain('email');
    expect(result).toContain('john@example.com');
  });

  it('should return empty string for session with no collected fields', () => {
    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [],
      startedAt: new Date(),
    };

    const result = buildFieldContext(session);

    expect(result).toBe('');
  });

  it('should handle null field values', () => {
    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [
        {
          fieldId: 'optional',
          value: null,
          collectedAt: new Date(),
        },
      ],
      startedAt: new Date(),
    };

    const result = buildFieldContext(session);

    expect(result).toContain('optional');
    expect(result).toContain('null');
  });

  it('should format multiple fields with proper structure', () => {
    const session: Session = {
      id: 'session1',
      formId: 'form1',
      status: SessionStatus.ACTIVE,
      turns: [],
      fields: [
        {
          fieldId: 'name',
          value: 'Alice',
          collectedAt: new Date(),
        },
        {
          fieldId: 'age',
          value: 25,
          collectedAt: new Date(),
        },
        {
          fieldId: 'city',
          value: 'Boston',
          collectedAt: new Date(),
        },
      ],
      startedAt: new Date(),
    };

    const result = buildFieldContext(session);

    // Should contain all three fields
    expect(result).toContain('name');
    expect(result).toContain('age');
    expect(result).toContain('city');

    // Should contain all three values
    expect(result).toContain('Alice');
    expect(result).toContain('25');
    expect(result).toContain('Boston');
  });
});
