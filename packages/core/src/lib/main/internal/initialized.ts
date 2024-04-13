import { SheriffConfig } from '../../config/sheriff-config';

export const initialized: {
  status: boolean;
  config: SheriffConfig | undefined;
} = { status: false, config: undefined };
