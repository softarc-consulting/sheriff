import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app': {
      children: {
        shared: {
          tags: ['domain:shared'],
        },
        bookings: {
          tags: ['domain:bookings'],
          children: { '+state': { tags: ['type:data'] } },
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
    'domain:*': ({ from, to }) => from === to,
    'type:feature': ({ to }) => to.startsWith('type:'),
    'type:data': 'type:model',
    'type:ui': 'type:model',
    'type:model': [],
  },
};
