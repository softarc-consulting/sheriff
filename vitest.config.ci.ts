import defaultConfig from './vitest.config';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  defaultConfig,
  defineConfig({
    test: {
      include: ['packages/**/*.spec.ts', 'packages/**/*.full-spec.ts'],
      coverage: { enabled: true },
    },
  }),
);
