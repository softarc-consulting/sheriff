import { expect } from 'vitest';
import { FsPath } from '../file-info/fs-path';
import { inVfs } from './in-vfs';
import { UserError } from '../error/user-error';

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
      message: () =>
        `expected ${received.toString()} to be ${expected.toString()}`,
    };
  },

  toThrowUserError(fn: () => void, userError: UserError) {
    let pass = false;
    let actual: unknown = 'no error';
    const { code, message } = userError;

    try {
      fn();
    } catch (error) {
      actual = error;
      pass =
        error instanceof UserError &&
        error.message === message &&
        error.code === code;
    }

    return {
      pass,
      message: () => {
        return `expected to throw UserError: ${code} - ${message}`;
      },
      actual,
      expected: userError,
    };
  },
});

interface CustomMatchers<R = unknown> {
  toBeVfsFile(expected: string): R;

  toBeVfsFiles(expected: string[]): R;

  toThrowUserError(userError: UserError): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion extends CustomMatchers {}
  }
}
