const defaultTsConfig = {
  compilerOptions: {
    target: "es2016",
    module: "commonjs",
    strict: true,
    skipLibCheck: true
  }
};


export interface TsConfig {
  baseUrl?: string;
  paths?: Record<string, string[]>;
}

export interface FullTsConfig {
  extends?: string;
  compilerOptions?: TsConfig;
}

export function tsConfig(config: Partial<TsConfig> = {}) {
  return JSON.stringify({
    compilerOptions: { ...defaultTsConfig.compilerOptions, ...config }
  });
}

export function fullTsConfig(config: Partial<FullTsConfig> = {}) {
  return JSON.stringify({
    extends: config.extends,
    compilerOptions: { ...defaultTsConfig.compilerOptions, ...(config.compilerOptions ?? {}) }
  })
}
