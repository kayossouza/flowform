/**
 * Main orchestrator logic for conversational form collection
 *
 * @module orchestrator
 */

import type {
  FormDefinition,
  Session,
  LlmClient,
  LlmMessage,
  OrchestratorResult,
  FieldValue,
} from '../types';
import { ClientError } from '../types';
import { validateField } from '../validation';
import { buildConversationHistory } from './prompt-builder';

/**
 * Determines the next required field to collect based on form definition and session state
 *
 * @param form - Form definition with all fields
 * @param session - Current session with collected fields
 * @returns Field name to collect next, or null if all required fields collected
 */
export function determineNextField(
  form: FormDefinition,
  session: Session
): string | null {
  const collectedFieldIds = new Set(
    session.fields.map((f) => f.fieldId)
  );

  // Find first required field not yet collected (respecting order)
  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

  for (const field of sortedFields) {
    if (field.required && !collectedFieldIds.has(field.id)) {
      return field.name;
    }
  }

  return null;
}

/**
 * Builds system prompt for LLM with form context and collected fields
 *
 * @param form - Form definition
 * @param session - Current session state
 * @returns System prompt string with form context and instructions
 */
export function buildSystemPrompt(
  form: FormDefinition,
  session: Session
): string {
  const formInfo = `Form: ${form.name}${
    form.description ? `\nDescription: ${form.description}` : ''
  }`;

  const fieldsInfo = form.fields
    .map(
      (field) =>
        `- ${field.label} (${field.name}, ${field.type})${field.required ? ' [REQUIRED]' : ' [OPTIONAL]'}${
          field.description ? `: ${field.description}` : ''
        }`
    )
    .join('\n');

  const collectedInfo =
    session.fields.length > 0
      ? `\n\nAlready Collected:\n${session.fields
          .map(
            (sf) =>
              `- ${sf.fieldId}: ${sf.value !== null ? String(sf.value) : 'null'}`
          )
          .join('\n')}`
      : '';

  return `You are a conversational form assistant collecting information for the following form:

${formInfo}

Fields to collect:
${fieldsInfo}${collectedInfo}

Your task:
1. Extract any field values mentioned in the user's message
2. Respond naturally and ask for the next missing required field
3. Return your response in JSON format:

{
  "botResponse": "Your natural language response to the user",
  "extractedFields": {
    "fieldName": "extractedValue"
  }
}

Important:
- Only extract fields that are explicitly mentioned in the form definition
- Use exact field names from the form definition
- If no new fields can be extracted, return empty extractedFields object
`;
}

/**
 * Parses and validates LLM response containing extracted fields
 *
 * @param llmResponse - Raw LLM response content (expected to be JSON)
 * @param form - Form definition to validate against
 * @returns Parsed response with botResponse and extractedFields
 * @throws ClientError if JSON is invalid or contains unknown fields
 */
function parseExtractedFields(
  llmResponse: string,
  form: FormDefinition
): { botResponse: string; extractedFields: Record<string, FieldValue> } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(llmResponse);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown parse error';
    throw new ClientError(
      'LLM returned invalid JSON',
      400,
      'INVALID_LLM_RESPONSE',
      {
        response: llmResponse,
        parseError: errorMessage,
      }
    );
  }

  // Type guard for expected structure
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('botResponse' in parsed) ||
    !('extractedFields' in parsed)
  ) {
    throw new ClientError(
      'LLM response missing required fields (botResponse, extractedFields)',
      400,
      'INVALID_LLM_RESPONSE',
      { response: llmResponse }
    );
  }

  const response = parsed as {
    botResponse: string;
    extractedFields: Record<string, unknown>;
  };

  // Validate all extracted fields exist in form definition
  const validFieldNames = new Set(form.fields.map((f) => f.name));

  for (const fieldName of Object.keys(response.extractedFields)) {
    if (!validFieldNames.has(fieldName)) {
      throw new ClientError(
        'Field not in form definition',
        400,
        'UNKNOWN_FIELD',
        { fieldName, formId: form.id }
      );
    }
  }

  return response as { botResponse: string; extractedFields: Record<string, FieldValue> };
}

/**
 * Determines if form is complete based on extracted fields
 *
 * @param form - Form definition
 * @param session - Current session
 * @param extractedFields - Newly extracted fields
 * @returns True if all required fields will be collected
 */
function isFormComplete(
  form: FormDefinition,
  session: Session,
  extractedFields: Record<string, FieldValue>
): boolean {
  const existingFieldIds = new Set(
    session.fields.map((f) => f.fieldId)
  );
  const newFieldIds = new Set(
    Object.keys(extractedFields)
      .map((name) => form.fields.find((f) => f.name === name)?.id)
      .filter((id): id is string => id !== undefined)
  );

  const allCollectedFieldIds = new Set([...existingFieldIds, ...newFieldIds]);
  const requiredFields = form.fields.filter((f) => f.required);

  return requiredFields.every((f) => allCollectedFieldIds.has(f.id));
}

/**
 * Executes one step of the LLM-driven form collection process
 *
 * This is a pure function that:
 * - Takes current form definition and session state
 * - Calls LLM to extract fields from user message
 * - Validates extracted fields
 * - Determines if form is complete
 * - Returns result without side effects
 *
 * @param form - Form definition
 * @param session - Current session state (not mutated)
 * @param userMessage - User's message to process
 * @param llmClient - LLM client for completion (dependency injection)
 * @returns OrchestratorResult with bot response, extracted fields, completion status
 * @throws ClientError for invalid LLM responses or unknown fields
 */
export async function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient
): Promise<OrchestratorResult> {
  // Build system prompt with form context
  const systemPrompt = buildSystemPrompt(form, session);

  // Build conversation history from session turns
  const conversationHistory = buildConversationHistory(session);

  // Build complete message array for LLM
  const messages: LlmMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  // Call LLM
  const llmResponse = await llmClient.complete(messages);

  // Parse and validate response
  const { botResponse, extractedFields } = parseExtractedFields(
    llmResponse.content,
    form
  );

  // Validate extracted field values (User Story 2: reject invalid values)
  const fieldMap = new Map(form.fields.map((f) => [f.name, f]));
  for (const [fieldName, fieldValue] of Object.entries(extractedFields)) {
    const fieldDef = fieldMap.get(fieldName)!;
    const validationResult = validateField(fieldDef, fieldValue);

    if (!validationResult.valid) {
      throw new ClientError(
        validationResult.error,
        400,
        'VALIDATION_ERROR',
        { fieldName, value: fieldValue, formId: form.id }
      );
    }
  }

  // Determine if form is complete
  const complete = isFormComplete(form, session, extractedFields);

  // Determine next field
  const hypotheticalSession: Session = {
    ...session,
    fields: [
      ...session.fields,
      ...Object.entries(extractedFields).map(([name, value]) => ({
        fieldId: form.fields.find((f) => f.name === name)!.id,
        value,
        collectedAt: new Date(),
      })),
    ],
  };

  const nextField = complete
    ? undefined
    : determineNextField(form, hypotheticalSession) ?? undefined;

  return {
    botResponse,
    extractedFields,
    isComplete: complete,
    nextField,
  };
}
