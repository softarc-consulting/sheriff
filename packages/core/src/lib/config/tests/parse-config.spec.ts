import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import * as ts from 'typescript';
import { parseConfig } from '../parse-config';
import { toFsPath } from '../../file-info/fs-path';
import getFs, { useVirtualFs } from '../../fs/getFs';
import {
  CollidingEncapsulationSettings,
  MissingModulesWithoutAutoTaggingError,
  TaggingAndModulesError,
} from '../../error/user-error';
import '../../test/expect.extensions';

describe('parse Config', () => {
  it('should read value', () => {
    const source = 'export const a = 1';

    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.NodeNext },
    });

    expect(outputText).toMatchSnapshot();
  });

  it('should the sheriff config', () => {
    const tsCode = parseConfig(
      toFsPath(__dirname + '/../../test/sheriff.config.ts'),
    );
    expect(Object.keys(tsCode)).toEqual([
      'version',
      'autoTagging',
      'modules',
      'depRules',
      'excludeRoot',
      'enableBarrelLess',
      'encapsulationPattern',
      'log',
      'entryFile',
      'isConfigFileMissing',
      'barrelFileName',
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
        modules: {},
        depRules: { noTag: 'noTag' },
        enableBarrelLess: false,
        encapsulationPattern: 'internal',
        excludeRoot: false,
        log: false,
        isConfigFileMissing: false,
        entryFile: '',
        barrelFileName: 'index.ts',
      });
    });

    it('should throw if modules is missing and autoTagging is disabled', () => {
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
      ).toThrowUserError(new MissingModulesWithoutAutoTaggingError());
    });

    it('should not throw if modules is present and autoTagging is disabled', () => {
      getFs().writeFile(
        'sheriff.config.ts',
        `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  autoTagging: false,
  modules: {}
};
      `,
      );

      expect(() =>
        parseConfig(toFsPath(getFs().cwd() + '/sheriff.config.ts')),
      ).not.toThrowUserError(new MissingModulesWithoutAutoTaggingError());
    });

    it('should not throw if tagging is present and autoTagging is disabled', () => {
      getFs().writeFile(
        'sheriff.config.ts',
        `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  autoTagging: false,
  tagging: {}
};
      `,
      );

      expect(() =>
        parseConfig(toFsPath(getFs().cwd() + '/sheriff.config.ts')),
      ).not.toThrowUserError(new MissingModulesWithoutAutoTaggingError());
    });

    it('should not throw if modules is empty and autoTagging does not exist', () => {
      getFs().writeFile(
        'sheriff.config.ts',
        `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  modules: {}
};
      `,
      );

      expect(() =>
        parseConfig(toFsPath(getFs().cwd() + '/sheriff.config.ts')),
      ).not.toThrowUserError(new MissingModulesWithoutAutoTaggingError());
    });

    it('should throw if both tagging and modules are available', () => {
      getFs().writeFile(
        'sheriff.config.ts',
        `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  modules: {},
  tagging: {}
};
      `,
      );

      expect(() =>
        parseConfig(toFsPath(getFs().cwd() + '/sheriff.config.ts')),
      ).toThrowUserError(new TaggingAndModulesError());
    });
  });

  it('should map a tagging to modules', () => {
    getFs().writeFile(
      'sheriff.config.ts',
      `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  tagging: {'src/app': 'app'}
};
      `,
    );

    const config: Record<string, unknown> = parseConfig(
      toFsPath(getFs().cwd() + '/sheriff.config.ts'),
    );
    expect(config['tagging']).toBeUndefined();
    expect(config['modules']).toEqual({ 'src/app': 'app' });
  });

  it('should use encapsulatedFolderNameForBarrelLess for encapsulationPatternForBarrellLess', () => {
    getFs().writeFile(
      'sheriff.config.ts',
      `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  depRules: {
    'root': 'noTag',
    'noTag': 'noTag',
  },
  encapsulatedFolderNameForBarrelLess: '_private'
};
      `,
    );

    expect(
      parseConfig(toFsPath(getFs().cwd() + '/sheriff.config.ts'))
        .encapsulationPattern,
    ).toBe('_private');
  });

  it('should throw if both encapsulatedFolderNameForBarrelLess and encapsulationPatternForBarrelLess exist', () => {
    getFs().writeFile(
      'sheriff.config.ts',
      `
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  depRules: {
    'root': 'noTag',
    'noTag': 'noTag',
  },
  encapsulatedFolderNameForBarrelLess: 'internal',
  encapsulationPattern: 'internal'
};
      `,
    );

    expect(() =>
      parseConfig(toFsPath(getFs().cwd() + '/sheriff.config.ts')),
    ).toThrowUserError(new CollidingEncapsulationSettings());
  });
});
