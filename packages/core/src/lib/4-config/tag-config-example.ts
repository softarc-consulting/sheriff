import { TagConfig } from './tag-config';

const angularCliConfig: TagConfig = {
  'src/app': {
    'domain/{domain}/{type}': ({ domain, type }) => [
      `domain:${domain}`,
      `type:${type}`,
    ],
    'shared/{libName}': 'domain:shared',
  },
};

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
