/**
 * Error types for orchestrator
 */

/**
 * Errors caused by caller (malformed input, bad configuration)
 *
 * ClientErrors should NOT be retried - they indicate a problem
 * with how the orchestrator was called, not a transient failure.
 *
 * @example
 * ```typescript
 * // Malformed JSON from LLM
 * throw new ClientError(
 *   'LLM returned invalid JSON',
 *   400,
 *   'INVALID_LLM_RESPONSE',
 *   { response: rawResponse }
 * );
 *
 * // Unknown field in extracted data
 * throw new ClientError(
 *   'Field not in form definition',
 *   400,
 *   'UNKNOWN_FIELD',
 *   { fieldName: 'invalidField', formId: form.id }
 * );
 * ```
 */
export class ClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ClientError';
    Object.setPrototypeOf(this, ClientError.prototype);
  }
}
