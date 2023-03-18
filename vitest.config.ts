import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: { provider: 'c8', reporter: ['text', 'html'] },
    exclude: ['test-projects', 'node_modules'],
  },
  resolve: {
    alias: {
      '@softarc/eslint-plugin-sheriff': 'packages/eslint-plugin/src/index.ts',
      '@softarc/sheriff-core': 'packages/core/src/index.ts',
    },
  },
});
