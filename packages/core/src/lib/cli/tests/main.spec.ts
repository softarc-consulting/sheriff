import { it, expect } from 'vitest';
import { mockCli } from './helpers/mock-cli';
import { main } from '../main';
import { getPackageJsonVersion } from './helpers/get-package-json-version';

it('should include the version in main', () => {
  const { allLogs } = mockCli();
  main();
  expect(allLogs()).toContain(`Sheriff (${getPackageJsonVersion()})`);
});
