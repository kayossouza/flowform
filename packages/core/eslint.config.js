import baseConfig from '@repo/eslint-config';

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      // Relax code metrics for test files
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
];
