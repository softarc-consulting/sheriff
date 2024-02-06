import { UserError } from '../../error/user-error';
import { cli } from '../cli';

/**
 * Catches Error for the CLI and prints `UserError` in
 * UI-friendly way. Everything else as it is.
 *
 * @param fn which should be 'error-handled'
 */
export function handleError(fn: () => void) {
  try {
    fn();
    cli.endProcessOk();
  } catch (error) {
    if (error instanceof UserError) {
      cli.logError(error.message);
    } else if (error instanceof Error) {
      cli.logError(error.message);
    } else {
      cli.logError(String(error));
    }
    cli.endProcessError();
  }
}
