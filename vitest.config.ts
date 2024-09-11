import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['packages/*/src/lib/**/*.ts'],
    },
    include: ['packages/**/*.spec.ts'],
    setupFiles: ['packages/core/src/lib/test/expect.extensions.ts'],
    alias: {
      '@softarc/eslint-plugin-sheriff': resolve(
        './packages/eslint-plugin/src/index.ts',
      ),
      '@softarc/sheriff-core': resolve('./packages/core/src/index.ts'),
    },
  },
});
