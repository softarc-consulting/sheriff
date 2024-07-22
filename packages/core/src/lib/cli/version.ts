import { cli } from '../cli/cli';

/**
 * Although the version is already shown in the CLI,
 * we still provide a separate command to simplify
 * certain CI runs, scripts which need to get the
 * version.
 */
export function version() {
  cli.log('0.16.0');
}
