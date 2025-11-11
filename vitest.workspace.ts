import { defineWorkspace } from 'vitest/config';

// Define workspace projects for Vitest
// Each package with tests should have its own vitest.config.ts
export default defineWorkspace([
  'packages/*/vitest.config.ts',
  'apps/*/vitest.config.ts',
]);
