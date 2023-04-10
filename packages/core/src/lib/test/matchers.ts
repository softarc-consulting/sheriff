import { expect } from 'vitest';
import { FsPath } from '../1-fs/fs-path';
import { inVfs } from './in-vfs';

expect.extend({
  toBeVfsFile(received: FsPath, expected: string) {
    return {
      pass: received === inVfs(expected),
      message: () => `expected ${received} to be ${expected}`,
    };
  },

  toBeVfsFiles(received: FsPath[], expected: string[]) {
    return {
      pass:
        JSON.stringify(received.sort()) ===
        JSON.stringify(expected.map(inVfs).sort()),
      message: () => `expected ${received} to be ${expected}`,
    };
  },
});

interface CustomMatchers<R = unknown> {
  toBeVfsFile(expected: string): R;
  toBeVfsFiles(expected: string[]): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Assertion extends CustomMatchers {}
  }
}
