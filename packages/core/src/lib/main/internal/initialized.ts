import { Configuration } from '../../config/configuration';

export const initialized: {
  status: boolean;
  config: Configuration | undefined;
} = { status: false, config: undefined };
