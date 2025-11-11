/**
 * Validation result types
 */

/**
 * Discriminated union for validation outcomes
 *
 * Use type narrowing for type-safe error handling:
 * ```typescript
 * const result = validateEmail('test@example.com');
 * if (!result.valid) {
 *   console.error(result.error);  // TypeScript knows error exists
 *   return;
 * }
 * // TypeScript knows validation passed here
 * ```
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };
