import { TagConfig } from './tag-config';

const angularCliConfig: TagConfig = {
  'src/app': {
    children: {
      'domain/{domain}/{type}': {
        tags: (_, { placeholders: { domain, type } }) => [
          `domain:${domain}`,
          `type:${type}`,
        ],
      },
      'shared/{libName}': {
        tags: 'domain:shared',
      },
    },
  },
};

const nxConfig: TagConfig = {
  'apps/flight-app/src/app': {
    children: {
      'domain/{domain}/{type}': {
        tags: (_, { placeholders: { domain, type } }) => [
          `domain:${domain}`,
          `type:${type}`,
        ],
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
    tags: (_, { placeholders: { domain, type } }) => [
      `domain:${domain}`,
      `type:${type}`,
    ],
  },
};
