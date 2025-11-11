import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateNumber,
  validateDate,
  validateEnum,
} from '../../src/validation/validators';

describe('validateEmail', () => {
  it('should return valid for correct email format', () => {
    const result = validateEmail('user@example.com');
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for email with subdomain', () => {
    const result = validateEmail('user@subdomain.example.com');
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for email with plus addressing', () => {
    const result = validateEmail('user+tag@example.com');
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid for missing @', () => {
    const result = validateEmail('userexample.com');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid email format',
    });
  });

  it('should return invalid for missing domain', () => {
    const result = validateEmail('user@');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid email format',
    });
  });

  it('should return invalid for missing local part', () => {
    const result = validateEmail('@example.com');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid email format',
    });
  });

  it('should return invalid for empty string', () => {
    const result = validateEmail('');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid email format',
    });
  });
});

describe('validatePhone', () => {
  it('should return valid for US phone with country code', () => {
    const result = validatePhone('+1-555-123-4567');
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for US phone without formatting', () => {
    const result = validatePhone('5551234567');
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for international format', () => {
    const result = validatePhone('+44-20-7123-4567');
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid for too short', () => {
    const result = validatePhone('123');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid phone format',
    });
  });

  it('should return invalid for letters', () => {
    const result = validatePhone('555-ABC-DEFG');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid phone format',
    });
  });

  it('should return invalid for empty string', () => {
    const result = validatePhone('');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid phone format',
    });
  });
});

describe('validateNumber', () => {
  it('should return valid for number within range', () => {
    const result = validateNumber(50, { min: 0, max: 100 });
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for number at min boundary', () => {
    const result = validateNumber(0, { min: 0, max: 100 });
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for number at max boundary', () => {
    const result = validateNumber(100, { min: 0, max: 100 });
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid for number below min', () => {
    const result = validateNumber(-1, { min: 0, max: 100 });
    expect(result).toEqual({
      valid: false,
      error: 'Number must be at least 0',
    });
  });

  it('should return invalid for number above max', () => {
    const result = validateNumber(101, { min: 0, max: 100 });
    expect(result).toEqual({
      valid: false,
      error: 'Number must be at most 100',
    });
  });

  it('should return valid when no constraints provided', () => {
    const result = validateNumber(12345, {});
    expect(result).toEqual({ valid: true });
  });

  it('should return valid with only min constraint', () => {
    const result = validateNumber(10, { min: 5 });
    expect(result).toEqual({ valid: true });
  });

  it('should return valid with only max constraint', () => {
    const result = validateNumber(10, { max: 20 });
    expect(result).toEqual({ valid: true });
  });
});

describe('validateDate', () => {
  it('should return valid for valid date string', () => {
    const result = validateDate('2024-01-15');
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for ISO 8601 datetime', () => {
    const result = validateDate('2024-01-15T10:30:00Z');
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for Date object', () => {
    const result = validateDate(new Date('2024-01-15'));
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid for invalid date string', () => {
    const result = validateDate('not-a-date');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid date format',
    });
  });

  it('should return invalid for invalid date like Feb 30', () => {
    const result = validateDate('2024-02-30');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid date format',
    });
  });

  it('should return invalid for empty string', () => {
    const result = validateDate('');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid date format',
    });
  });
});

describe('validateEnum', () => {
  it('should return valid for value in options', () => {
    const result = validateEnum('red', ['red', 'green', 'blue']);
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for first option', () => {
    const result = validateEnum('small', ['small', 'medium', 'large']);
    expect(result).toEqual({ valid: true });
  });

  it('should return valid for last option', () => {
    const result = validateEnum('large', ['small', 'medium', 'large']);
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid for value not in options', () => {
    const result = validateEnum('purple', ['red', 'green', 'blue']);
    expect(result).toEqual({
      valid: false,
      error: 'Value must be one of: red, green, blue',
    });
  });

  it('should return invalid for case mismatch', () => {
    const result = validateEnum('Red', ['red', 'green', 'blue']);
    expect(result).toEqual({
      valid: false,
      error: 'Value must be one of: red, green, blue',
    });
  });

  it('should return invalid for empty string', () => {
    const result = validateEnum('', ['red', 'green', 'blue']);
    expect(result).toEqual({
      valid: false,
      error: 'Value must be one of: red, green, blue',
    });
  });

  it('should handle single option', () => {
    const result = validateEnum('only', ['only']);
    expect(result).toEqual({ valid: true });
  });
});
