import { TagConfig } from './tag-config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const angularCliConfig: TagConfig = {
  'src/app': {
    'domain/{domain}/{type}': ({ domain, type }) => [
      `domain:${domain}`,
      `type:${type}`,
    ],
    'shared/{libName}': 'domain:shared',
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nxConfig: TagConfig = {
  'apps/flight-app/src/app': {
    'domain/{domain}/{type}': ({ domain, type }) => [
      `domain:${domain}`,
      `type:${type}`,
    ],
    'shared/{libName}': {
      tags: 'domain:shared',
    },
  },
  'libs/shared/{lib}': ['domain:shared'],
  'libs/{domain}/{type}': ({ domain, type }) => [
    `domain:${domain}`,
    `type:${type}`,
  ],
};
