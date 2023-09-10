import { CompilerOptions } from 'typescript';

export interface TsConfig {
  compilerOptions: CompilerOptions;
  extends: string;
}
