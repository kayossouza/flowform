/**
 * Field type definitions for conversational forms
 */

/**
 * Supported field types for form fields
 */
export enum FieldType {
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  ENUM = 'ENUM',
  LONG_TEXT = 'LONG_TEXT',
}

/**
 * Union type for all possible field values
 */
export type FieldValue = string | number | Date | null;

/**
 * Optional validation constraints for fields
 */
export interface ValidationRule {
  /** For NUMBER: minimum value; For TEXT: min length */
  min?: number;
  /** For NUMBER: maximum value; For TEXT: max length */
  max?: number;
  /** Custom regex pattern (advanced use case) */
  pattern?: string;
  /** For ENUM: allowed values */
  options?: string[];
}

/**
 * Represents a single field in a form
 */
export interface FormField {
  /** Unique identifier (e.g., "field_001") */
  id: string;
  /** Technical name (e.g., "emailAddress") */
  name: string;
  /** Human-readable label (e.g., "Email Address") */
  label: string;
  /** Field type */
  type: FieldType;
  /** Is this field required? */
  required: boolean;
  /** Optional validation constraints */
  validation?: ValidationRule;
  /** Display/collection order (0-indexed) */
  order: number;
  /** Optional help text for users */
  description?: string;
}
