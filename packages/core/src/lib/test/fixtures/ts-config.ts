const defaultTsConfig = {
  compilerOptions: {
    target: 'es2016',
    module: 'commonjs',
    strict: true,
    skipLibCheck: true,
  },
};

export interface TsConfig {
  baseUrl?: string;
  paths?: Record<string, string[]>;
}

export function tsConfig(config: Partial<TsConfig> = {}) {
  return JSON.stringify({
    compilerOptions: { ...defaultTsConfig.compilerOptions, ...config },
  });
}
