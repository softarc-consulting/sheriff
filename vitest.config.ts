import { defineConfig, UserConfigExport } from "vitest/config";

export const defaultConfig = {
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
    },
    include: ['packages/**/*.spec.ts']
  },
  resolve: {
    alias: {
      '@softarc/eslint-plugin-sheriff': 'packages/eslint-plugin/src/index.ts',
      '@softarc/sheriff-core': 'packages/core/src/index.ts',
    },
  },
} satisfies UserConfigExport;

export default defineConfig(defaultConfig);
