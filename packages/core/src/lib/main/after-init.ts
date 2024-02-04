import { SheriffConfig } from '../config/sheriff-config';
import { config } from '../test/sheriff.config';
import { initialized } from './internal/initialized';
import { callbacks } from './internal/callback';

export function afterInit(
  callback: (config: SheriffConfig | undefined) => void
) {
  if (initialized.status) {
    callback(config);
  } else {
    callbacks.push(callback);
  }
}
