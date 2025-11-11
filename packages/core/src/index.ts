/**
 * @flowform/core - Pure function orchestrator for conversational forms
 *
 * Zero external dependencies. Pure TypeScript only.
 */

// Re-export all types
export type {
  FieldValue,
  FormField,
  FormDefinition,
  Session,
  SessionField,
  SessionTurn,
  ValidationRule,
  ValidationResult,
  LlmClient,
  LlmMessage,
  LlmResponse,
  OrchestratorResult,
} from './types';

export { FieldType, SessionStatus, TurnRole, ClientError } from './types';

/**
 * Validation functions for field values
 * Use validateField as main dispatcher, or specific validators for custom logic
 */
export {
  validateEmail,
  validatePhone,
  validateNumber,
  validateDate,
  validateEnum,
  validateField,
} from './validation';

/**
 * Orchestrator functions for conversational form collection
 * Primary entry point: runLlmStep
 * Helper functions: buildConversationHistory, buildFieldContext, buildSystemPrompt, determineNextField
 */
export {
  runLlmStep,
  determineNextField,
  buildSystemPrompt,
  buildConversationHistory,
  buildFieldContext,
} from './orchestrator';
