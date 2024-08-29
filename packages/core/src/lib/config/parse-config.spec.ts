import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import * as ts from 'typescript';
import { parseConfig } from './parse-config';
import { toFsPath } from '../file-info/fs-path';
import { TsConfig } from '../file-info/ts-config';
import getFs, { useVirtualFs } from '../fs/getFs';
import { MissingTaggingWithoutAutoTagging } from '../error/user-error';
import '../test/expect.extensions';

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
      toFsPath(__dirname + '/../test/sheriff.config.ts'),
    );
    expect(Object.keys(tsCode)).toEqual([
      'version',
      'autoTagging',
      'tagging',
      'depRules',
      'excludeRoot',
      'log',
      'entryFile',
      'isConfigFileMissing',
    ]);
  });

  describe('virtual fs', () => {
    beforeAll(() => {
      useVirtualFs();
    });

    beforeEach(() => {
      getFs().reset();
    });

    it('should set default values', () => {
      getFs().writeFile(
        'sheriff.config.ts',
        `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  depRules: {
    'noTag': 'noTag',
  },
};
      `,
      );

      const config = parseConfig(
        toFsPath(getFs().cwd() + '/sheriff.config.ts'),
      );
      expect(config).toEqual({
        version: 1,
        autoTagging: true,
        tagging: {},
        depRules: { noTag: 'noTag' },
        excludeRoot: false,
        log: false,
        isConfigFileMissing: false,
        entryFile: '',
      });
    });

    it('should throw if tagging is missing and autoTagging is disabled', () => {
      getFs().writeFile(
        'sheriff.config.ts',
        `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  autoTagging: false,
};
      `,
      );

      expect(() =>
        parseConfig(toFsPath(getFs().cwd() + '/sheriff.config.ts')),
      ).toThrowUserError(new MissingTaggingWithoutAutoTagging());
    });
  });
});
