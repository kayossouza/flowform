import type { FieldValue } from './field';

/**
 * Session and conversation types
 */

/**
 * Lifecycle states for form sessions
 */
export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

/**
 * Identifies who sent each message
 */
export enum TurnRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

/**
 * Represents one message in the conversation
 */
export interface SessionTurn {
  /** USER or ASSISTANT */
  role: TurnRole;
  /** Message text */
  content: string;
  /** When message was sent */
  timestamp: Date;
}

/**
 * Represents a collected field value
 */
export interface SessionField {
  /** Must match FormField.id */
  fieldId: string;
  /** Collected value (string | number | Date) */
  value: FieldValue;
  /** When field was collected */
  collectedAt: Date;
}

/**
 * Complete session state for a form submission
 */
export interface Session {
  /** Unique session identifier */
  id: string;
  /** References FormDefinition.id */
  formId: string;
  /** ACTIVE, COMPLETED, or ABANDONED */
  status: SessionStatus;
  /** Conversation history (immutable) */
  turns: readonly SessionTurn[];
  /** Collected field values (immutable) */
  fields: readonly SessionField[];
  /** Session start time */
  startedAt: Date;
  /** Session completion time (if completed) */
  completedAt?: Date;
}
