import { describe, it, beforeEach, beforeAll, vitest, expect } from 'vitest';
import getFs, { useVirtualFs } from '../../fs/getFs';
import { init } from '../init';
import { mockCli } from './helpers/mock-cli';
import { toFsPath } from '../../file-info/fs-path';
import { createProject } from '../../test/project-creator';

describe('init', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    vitest.restoreAllMocks();
  });

  it('should create the file', () => {
    mockCli();
    const fs = getFs();

    init();
    const sheriffConfig = fs.readFile(
      toFsPath(fs.join(fs.cwd(), './sheriff.config.ts')),
    );
    expect(sheriffConfig).toMatchSnapshot('sheriff.config');
  });

  it('should print an error message if the file exists', () => {
    const { allErrorLogs, allLogs } = mockCli();
    createProject({
      'sheriff.config.ts': [],
    });

    init();

    expect(allLogs()).toMatchSnapshot('init');
    expect(allErrorLogs()).toBe('');
  });
});
