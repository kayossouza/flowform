import type { FieldValue } from './field';

/**
 * Orchestrator result types
 */

/**
 * Output from runLlmStep function
 */
export interface OrchestratorResult {
  /**
   * Natural language response to show the user
   * @example "Thanks John! What's your email address?"
   */
  botResponse: string;

  /**
   * Fields extracted from user's message this turn
   * Keys are field names (matching FormField.name)
   * @example { fullName: "John Doe", email: "john@example.com" }
   */
  extractedFields: Record<string, FieldValue>;

  /**
   * Whether all required fields are collected and valid
   * When true, form submission is complete
   */
  isComplete: boolean;

  /**
   * Suggested next field to collect (optional hint)
   * @example "email"
   */
  nextField?: string;
}
