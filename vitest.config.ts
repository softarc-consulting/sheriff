import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    include: ['packages/**/*.spec.ts'],
    alias: {
      '@softarc/eslint-plugin-sheriff': resolve(
        './packages/eslint-plugin/src/index.ts',
      ),
      '@softarc/sheriff-core': resolve('./packages/core/src/index.ts'),
    },
  },
});
