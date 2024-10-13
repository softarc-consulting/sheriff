import { Configuration } from '../config/configuration';
import { initialized } from './internal/initialized';
import { callbacks } from './internal/callback';

export function afterInit(
  callback: (config: Configuration | undefined) => void,
) {
  if (initialized.status) {
    callback(initialized.config);
  } else {
    callbacks.push(callback);
  }
}
