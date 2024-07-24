import { expect, it } from 'vitest';
import { mockCli } from './helpers/mock-cli';
import { main } from '../main';
import { version } from '../../../../package.json';

it('should print out the current version according to the package.json', () => {
  const { allLogs } = mockCli();
  main('version');

  expect(allLogs()).toBe(version);
});
