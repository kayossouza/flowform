/**
 * Prompt building utilities for LLM interactions
 *
 * @module prompt-builder
 */

import type { Session, LlmMessage } from '../types';
import { TurnRole } from '../types';

/**
 * Converts session conversation history to LlmMessage format
 * Maps TurnRole to LLM role strings ('user' | 'assistant')
 *
 * @param session - Session with conversation turns
 * @returns Array of LlmMessage objects for LLM context
 */
export function buildConversationHistory(session: Session): LlmMessage[] {
  return session.turns.map((turn) => ({
    role: turn.role === TurnRole.USER ? 'user' : 'assistant',
    content: turn.content,
  }));
}

/**
 * Formats collected field values as context string for LLM
 * Returns empty string if no fields have been collected
 *
 * @param session - Session with collected fields
 * @returns Formatted field context string or empty string
 */
export function buildFieldContext(session: Session): string {
  if (session.fields.length === 0) {
    return '';
  }

  const fieldLines = session.fields.map(
    (field) => `- ${field.fieldId}: ${JSON.stringify(field.value)}`
  );

  return `Collected fields:\n${fieldLines.join('\n')}`;
}
