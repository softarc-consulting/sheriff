import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app': {
      children: {
        'shared/{type}': {
          tags: (_, { placeholders: { type } }) => ['shared', `shared:${type}`],
        },
        bookings: {
          tags: ['domain:bookings'],
          children: { '+state': { tags: ['type:data'] } },
        },
        'customers/api': {
          tags: ['type:api', 'domain:customers', 'domain:customers:api'],
        },
        '{domain}': {
          tags: (_, { placeholders: { domain } }) => [`domain:${domain}`],
          children: {
            '{type}': {
              tags: (_, { placeholders: { type } }) => [`type:${type}`],
            },
          },
        },
      },
    },
  },
  depRules: {
    root: ['type:feature', 'shared'],
    'domain:*': ({ from, to }) => from === to,
    'domain:bookings': 'domain:customers:api',
    'type:feature': ({ to }) => to.startsWith('type:'),
    'type:data': 'type:model',
    'type:ui': 'type:model',
    'type:model': [],
  },
};
