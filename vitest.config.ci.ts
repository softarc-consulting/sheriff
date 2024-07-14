import { defaultConfig } from './vitest.config';
import { defineConfig, UserConfigExport } from 'vitest/config';
import { InlineConfig } from 'vitest';

const config: UserConfigExport = {
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    include: ['packages/**/*.spec.ts', 'packages/**/*.full-spec.ts'],
    coverage: { enabled: true },
  },
};

export default defineConfig(config);
