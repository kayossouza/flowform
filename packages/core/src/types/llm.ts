/**
 * LLM client interface types
 */

/**
 * Represents a message in LLM conversation
 */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Response from LLM completion API
 */
export interface LlmResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM Client Interface
 *
 * Abstraction for LLM providers (OpenAI, Anthropic, etc.)
 * Implementations live in @flowform/llm package (separate from core)
 *
 * Minimal interface following Interface Segregation Principle.
 * Only includes what the orchestrator needs.
 *
 * @example
 * ```typescript
 * // Mock for testing:
 * class MockLlmClient implements LlmClient {
 *   async complete(messages: LlmMessage[]): Promise<LlmResponse> {
 *     return { content: '{"botMessage":"Test response",...}' };
 *   }
 * }
 * ```
 */
export interface LlmClient {
  /**
   * Complete a conversation with the LLM
   *
   * @param messages - Array of conversation messages
   * @returns Promise resolving to LLM response
   * @throws ServerError on LLM API failures (provider's responsibility to retry)
   */
  complete(messages: LlmMessage[]): Promise<LlmResponse>;
}
