import { describe, expect, it } from 'vitest';
import { InvalidPathError } from '../../error/user-error';
import { mockCli } from './helpers/mock-cli';
import { handleError } from '../internal/handle-error';

describe('with error handling', () => {
  it('should execute the function', () => {
    mockCli();
    let a = 1;

    handleError(() => a++);

    expect(a).toBe(2);
  });

  it('should print out the message of an UserError', () => {
    const { allErrorLogs } = mockCli();
    handleError(() => {
      throw new InvalidPathError('sheriff', 'src/main.ts');
    });

    expect(allErrorLogs()).toBe(
      'invalid path mapping detected: sheriff: src/main.ts. Please verify that the path exists.',
    );
  });

  it('should print out the message of an Error', () => {
    const { allErrorLogs } = mockCli();
    handleError(() => {
      throw new Error('nix geht');
    });

    expect(allErrorLogs()).toBe('nix geht');
  });

  it('should print out the just the error if not of type Error', () => {
    const { allErrorLogs } = mockCli();

    handleError(() => {
      throw 'nix geht';
    });

    expect(allErrorLogs()).toBe('nix geht');
  });
});
