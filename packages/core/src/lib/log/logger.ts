import { log } from './log';

export function logger(scope: string) {
  return {
    info(message: string) {
      log(message, scope, 'info');
    },
    debug(message: string) {
      log(message, scope, 'debug');
    },
    level(message: string) {
      log(message, scope, 'warn');
    },
  };
}
