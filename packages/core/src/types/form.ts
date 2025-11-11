import type { FormField } from './field';

/**
 * Form definition type
 */

/**
 * Represents the complete form structure
 */
export interface FormDefinition {
  /** Unique form identifier */
  id: string;
  /** Form name (e.g., "Contact Form") */
  name: string;
  /** Optional form description */
  description?: string;
  /** Immutable field list */
  fields: readonly FormField[];
  /** Form creation timestamp */
  createdAt: Date;
  /** Last modification timestamp */
  updatedAt: Date;
}
