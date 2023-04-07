import { SheriffConfig } from '../4-config/config';

export const config: SheriffConfig = {
  version: 1,
  tagging: {
    'apps/flight-app/src/app': {
      children: {
        'domain/{domain}/{type}': {
          tags: ({ domain, type }) => [`domain:${domain}`, `type:${type}`],
        },
        'shared/{libName}': {
          tags: 'domain:shared',
        },
      },
    },
    'libs/shared/{lib}': {
      tags: ['domain:shared'],
    },
    'libs/{domain}/{type}': {
      tags: ({ domain, type }) => [`domain:${domain}`, `type:${type}`],
    },
  },
  depRules: {
    'domain:*': ({ from, to }) => from === to,
  },
};
