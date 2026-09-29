import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['packages/*/src/lib/**/*.ts'],
    },
    include: ['packages/**/*.spec.ts'],
    setupFiles: ['packages/core/src/lib/test/expect.extensions.ts'],
    alias: {
      '@sheriff-arch/eslint-plugin-sheriff': resolve(
        './packages/eslint-plugin/src/index.ts',
      ),
      '@sheriff-arch/core': resolve('./packages/core/src/index.ts'),
    },
  },
});
