import { UserError } from '@softarc/sheriff-core';

declare module 'vitest' {
  interface Assertion<T = never> {

    toBeVfsFile(expected: string): T;

    toBeVfsFiles(expected: string[]): T;

    toThrowUserError(userError: UserError): T;
  }
}
