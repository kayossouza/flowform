import { defineConfig } from 'vitest/config';

export const sharedConfig = defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // CRITICAL: Pick up monorepo dependency changes in watch mode
    deps: {
      inline: true,
    },

    // Prevent infinite rebuild loops
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.ts',
        '**/*.config.js',
        '**/dist/**',
        '**/node_modules/**',
        '**/.next/**',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
