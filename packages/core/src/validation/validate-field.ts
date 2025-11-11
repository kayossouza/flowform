/**
 * Field validation dispatcher - delegates to type-specific validators
 *
 * @module validate-field
 */

import type { FormField, FieldValue, ValidationResult } from '../types';
import { FieldType } from '../types';
import {
  validateEmail,
  validatePhone,
  validateNumber,
  validateDate,
  validateEnum,
} from './validators';

/**
 * Checks if a value satisfies the required constraint
 *
 * @param field - Field definition
 * @param value - Value to check
 * @returns ValidationResult for required constraint
 */
function checkRequired(
  field: FormField,
  value: FieldValue
): ValidationResult | null {
  const isNull = value === null || value === undefined;

  if (field.required && isNull) {
    return { valid: false, error: 'Field is required' };
  }

  if (!field.required && isNull) {
    return { valid: true };
  }

  return null; // Continue with type-specific validation
}

/**
 * Validates a NUMBER field value
 */
function validateNumberField(
  value: FieldValue,
  validation?: { min?: number; max?: number }
): ValidationResult {
  const numValue = typeof value === 'number' ? value : Number(value);
  const rules = validation || {};
  return validateNumber(numValue, {
    min: rules.min,
    max: rules.max,
  });
}

/**
 * Validates a DATE field value
 */
function validateDateField(value: FieldValue): ValidationResult {
  if (value instanceof Date || typeof value === 'string') {
    return validateDate(value);
  }
  return { valid: false, error: 'Invalid date format' };
}

/**
 * Validates an ENUM field value
 */
function validateEnumField(
  value: FieldValue,
  validation?: { options?: string[] }
): ValidationResult {
  const strValue = String(value);
  const options = validation?.options || [];
  return validateEnum(strValue, options);
}

/**
 * Validates a field value against its field definition
 * Dispatches to appropriate type-specific validator
 *
 * @param field - Field definition with type and validation rules
 * @param value - Value to validate
 * @returns ValidationResult indicating success or failure with error message
 */
export function validateField(
  field: FormField,
  value: FieldValue
): ValidationResult {
  // Check required constraint
  const requiredResult = checkRequired(field, value);
  if (requiredResult !== null) {
    return requiredResult;
  }

  // Dispatch to type-specific validators
  switch (field.type) {
    case FieldType.EMAIL:
      return validateEmail(String(value));

    case FieldType.PHONE:
      return validatePhone(String(value));

    case FieldType.NUMBER:
      return validateNumberField(value, field.validation);

    case FieldType.DATE:
      return validateDateField(value);

    case FieldType.ENUM:
      return validateEnumField(value, field.validation);

    case FieldType.TEXT:
    case FieldType.LONG_TEXT:
      return { valid: true };

    default: {
      const exhaustiveCheck: never = field.type;
      return exhaustiveCheck;
    }
  }
}
