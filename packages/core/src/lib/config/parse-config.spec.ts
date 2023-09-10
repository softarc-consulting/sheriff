import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { parseConfig } from './parse-config';
import { toFsPath } from '../file-info/fs-path';
import { TsConfig } from '../file-info/ts-config';

describe('parse Config', () => {
  it('should read value', () => {
    const source = 'export const a = 1';

    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.NodeNext },
    });

    const result = eval(outputText) as TsConfig;
    expect(result).toBe(1);
  });

  it('should the sheriff config', () => {
    const tsCode = parseConfig(
      toFsPath(__dirname + '/../test/sheriff.config.ts')
    );
    expect(Object.keys(tsCode)).toEqual(['version', 'tagging', 'depRules']);
  });
});
