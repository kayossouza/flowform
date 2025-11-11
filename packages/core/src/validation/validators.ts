/**
 * Field-specific validators for common data types
 *
 * @module validators
 */

import type { ValidationResult } from '../types';

/**
 * Standard email regex pattern
 * Matches: localpart@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number character validation regex
 * Allows: digits, spaces, +, -, parentheses
 */
const PHONE_REGEX = /^[\d\s+\-()]+$/;

/**
 * Minimum number of digits required for a valid phone number
 */
const MIN_PHONE_DIGITS = 10;

/**
 * Validates email format using standard email regex pattern
 *
 * @param value - Email string to validate
 * @returns ValidationResult indicating success or failure with error message
 */
export function validateEmail(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!EMAIL_REGEX.test(value)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validates phone number format
 * Accepts various formats: +1-555-123-4567, 5551234567, +44-20-7123-4567
 *
 * @param value - Phone string to validate
 * @returns ValidationResult indicating success or failure with error message
 */
export function validatePhone(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Invalid phone format' };
  }

  // Remove all non-digit characters to check minimum length
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly.length < MIN_PHONE_DIGITS) {
    return { valid: false, error: 'Invalid phone format' };
  }

  if (!PHONE_REGEX.test(value)) {
    return { valid: false, error: 'Invalid phone format' };
  }

  return { valid: true };
}

/**
 * Validates a number value against min/max constraints
 *
 * @param value - Number to validate
 * @param rules - Validation rules with optional min and max
 * @returns ValidationResult indicating success or failure with error message
 */
export function validateNumber(
  value: number,
  rules: { min?: number; max?: number }
): ValidationResult {
  if (rules.min !== undefined && value < rules.min) {
    return { valid: false, error: `Number must be at least ${rules.min}` };
  }

  if (rules.max !== undefined && value > rules.max) {
    return { valid: false, error: `Number must be at most ${rules.max}` };
  }

  return { valid: true };
}

/**
 * Validates ISO date string parts match parsed date
 * Catches invalid dates like '2024-02-30' that JavaScript auto-corrects
 *
 * @param dateString - ISO date string (YYYY-MM-DD format)
 * @param dateObj - Parsed Date object to validate against
 * @returns ValidationResult
 */
function validateIsoDateParts(
  dateString: string,
  dateObj: Date
): ValidationResult {
  const datePart = dateString.split('T')[0];
  if (!datePart) {
    return { valid: false, error: 'Invalid date format' };
  }

  const parts = datePart.split('-');
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
    return { valid: false, error: 'Invalid date format' };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Use UTC methods to avoid timezone issues
  if (
    dateObj.getUTCFullYear() !== year ||
    dateObj.getUTCMonth() + 1 !== month ||
    dateObj.getUTCDate() !== day
  ) {
    return { valid: false, error: 'Invalid date format' };
  }

  return { valid: true };
}

/**
 * Validates a date value
 * Accepts Date objects or date strings that can be parsed
 *
 * @param value - Date value to validate (Date object or string)
 * @returns ValidationResult indicating success or failure with error message
 */
export function validateDate(value: Date | string): ValidationResult {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: 'Invalid date format' };
  }

  let dateObj: Date;

  if (value instanceof Date) {
    dateObj = value;
  } else {
    dateObj = new Date(value);
  }

  // Check if date is valid (not NaN)
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  // Additional validation for ISO string dates: check if date parts match
  // This catches cases like '2024-02-30' which JavaScript parses as March 2
  if (typeof value === 'string') {
    const isoFormat = /^\d{4}-\d{2}-\d{2}/;
    if (isoFormat.test(value)) {
      return validateIsoDateParts(value, dateObj);
    }
  }

  return { valid: true };
}

/**
 * Validates that a value is one of the allowed enum options
 *
 * @param value - Value to validate
 * @param options - Array of allowed values
 * @returns ValidationResult indicating success or failure with error message
 */
export function validateEnum(
  value: string,
  options: string[]
): ValidationResult {
  if (!options.includes(value)) {
    return {
      valid: false,
      error: `Value must be one of: ${options.join(', ')}`,
    };
  }

  return { valid: true };
}
