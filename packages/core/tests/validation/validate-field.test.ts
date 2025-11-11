import { describe, it, expect } from 'vitest';
import { validateField } from '../../src/validation/validate-field';
import { FieldType } from '../../src/types';

describe('validateField - User Story 1 (EMAIL/PHONE only)', () => {
  it('should validate EMAIL field with valid email', () => {
    const field = {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: FieldType.EMAIL,
      required: true,
      order: 1,
    };

    const result = validateField(field, 'user@example.com');
    expect(result).toEqual({ valid: true });
  });

  it('should validate EMAIL field with invalid email', () => {
    const field = {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: FieldType.EMAIL,
      required: true,
      order: 1,
    };

    const result = validateField(field, 'invalid-email');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid email format',
    });
  });

  it('should validate PHONE field with valid phone', () => {
    const field = {
      id: 'phone',
      name: 'phone',
      label: 'Phone Number',
      type: FieldType.PHONE,
      required: true,
      order: 2,
    };

    const result = validateField(field, '+1-555-123-4567');
    expect(result).toEqual({ valid: true });
  });

  it('should validate PHONE field with invalid phone', () => {
    const field = {
      id: 'phone',
      name: 'phone',
      label: 'Phone Number',
      type: FieldType.PHONE,
      required: true,
      order: 2,
    };

    const result = validateField(field, '123');
    expect(result).toEqual({
      valid: false,
      error: 'Invalid phone format',
    });
  });

  it('should validate TEXT field (no validation for US1)', () => {
    const field = {
      id: 'name',
      name: 'name',
      label: 'Full Name',
      type: FieldType.TEXT,
      required: true,
      order: 0,
    };

    const result = validateField(field, 'John Doe');
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid for null value on required field', () => {
    const field = {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: FieldType.EMAIL,
      required: true,
      order: 1,
    };

    const result = validateField(field, null);
    expect(result).toEqual({
      valid: false,
      error: 'Field is required',
    });
  });

  it('should return valid for null value on optional field', () => {
    const field = {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: FieldType.EMAIL,
      required: false,
      order: 1,
    };

    const result = validateField(field, null);
    expect(result).toEqual({ valid: true });
  });

  it('should validate NUMBER field with min/max constraints', () => {
    const field = {
      id: 'age',
      name: 'age',
      label: 'Age',
      type: FieldType.NUMBER,
      required: true,
      validation: { min: 18, max: 120 },
      order: 3,
    };

    const validResult = validateField(field, 25);
    expect(validResult).toEqual({ valid: true });

    const tooLowResult = validateField(field, 17);
    expect(tooLowResult).toEqual({
      valid: false,
      error: 'Number must be at least 18',
    });

    const tooHighResult = validateField(field, 121);
    expect(tooHighResult).toEqual({
      valid: false,
      error: 'Number must be at most 120',
    });
  });

  it('should validate DATE field', () => {
    const field = {
      id: 'birthdate',
      name: 'birthdate',
      label: 'Birth Date',
      type: FieldType.DATE,
      required: true,
      order: 4,
    };

    const validResult = validateField(field, new Date('1990-01-15'));
    expect(validResult).toEqual({ valid: true });

    const invalidResult = validateField(field, 'not-a-date');
    expect(invalidResult).toEqual({
      valid: false,
      error: 'Invalid date format',
    });
  });

  it('should validate ENUM field with options', () => {
    const field = {
      id: 'color',
      name: 'color',
      label: 'Favorite Color',
      type: FieldType.ENUM,
      required: true,
      validation: { options: ['red', 'green', 'blue'] },
      order: 5,
    };

    const validResult = validateField(field, 'red');
    expect(validResult).toEqual({ valid: true });

    const invalidResult = validateField(field, 'purple');
    expect(invalidResult).toEqual({
      valid: false,
      error: 'Value must be one of: red, green, blue',
    });
  });

  it('should validate LONG_TEXT field (no special validation)', () => {
    const field = {
      id: 'bio',
      name: 'bio',
      label: 'Biography',
      type: FieldType.LONG_TEXT,
      required: true,
      order: 6,
    };

    const result = validateField(field, 'A long biography text...');
    expect(result).toEqual({ valid: true });
  });

  it('should handle all field types correctly', () => {
    // TEXT
    expect(
      validateField(
        {
          id: 'name',
          name: 'name',
          label: 'Name',
          type: FieldType.TEXT,
          required: true,
          order: 0,
        },
        'John'
      )
    ).toEqual({ valid: true });

    // EMAIL
    expect(
      validateField(
        {
          id: 'email',
          name: 'email',
          label: 'Email',
          type: FieldType.EMAIL,
          required: true,
          order: 1,
        },
        'john@example.com'
      )
    ).toEqual({ valid: true });

    // PHONE
    expect(
      validateField(
        {
          id: 'phone',
          name: 'phone',
          label: 'Phone',
          type: FieldType.PHONE,
          required: true,
          order: 2,
        },
        '+1-555-123-4567'
      )
    ).toEqual({ valid: true });

    // NUMBER
    expect(
      validateField(
        {
          id: 'age',
          name: 'age',
          label: 'Age',
          type: FieldType.NUMBER,
          required: true,
          validation: { min: 0, max: 150 },
          order: 3,
        },
        25
      )
    ).toEqual({ valid: true });

    // DATE
    expect(
      validateField(
        {
          id: 'date',
          name: 'date',
          label: 'Date',
          type: FieldType.DATE,
          required: true,
          order: 4,
        },
        new Date('2024-01-15')
      )
    ).toEqual({ valid: true });

    // ENUM
    expect(
      validateField(
        {
          id: 'size',
          name: 'size',
          label: 'Size',
          type: FieldType.ENUM,
          required: true,
          validation: { options: ['S', 'M', 'L'] },
          order: 5,
        },
        'M'
      )
    ).toEqual({ valid: true });

    // LONG_TEXT
    expect(
      validateField(
        {
          id: 'notes',
          name: 'notes',
          label: 'Notes',
          type: FieldType.LONG_TEXT,
          required: true,
          order: 6,
        },
        'Some long text content'
      )
    ).toEqual({ valid: true });
  });
});
