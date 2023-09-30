import { pid } from 'process';
import { LogLevel } from './log-level';
import { afterInit } from '../init/init';
import getFs from '../fs/getFs';

let logQueue: string[] = [];
let initialised = false;
let enabled = false;

/**
 * resets the logger. only used in tests.
 */
export const reset = () => {
  initialised = false;
  enabled = false;
  logQueue = [];
};

afterInit((config) => {
  enabled = Boolean(config?.log);
  if (enabled) {
    for (const element of logQueue) {
      doLog(element);
    }
  }
  logQueue = [];
  initialised = true;
});

export function log(message: string, scope = '', level: LogLevel) {
  const data = [scope, new Date().toISOString(), level, pid, message].join(
    ' - '
  );
  if (initialised) {
    if (enabled) {
      doLog(data);
    }
  } else {
    logQueue.push(data);
  }
}

export function doLog(data: string) {
  getFs().appendFile('sheriff.log', data);
}
