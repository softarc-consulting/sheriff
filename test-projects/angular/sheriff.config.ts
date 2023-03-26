import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app/': {
      children: {
        shared: { tags: 'shared' },
        'domains/{domain}': {
          tags: (_, { placeholders: { domain } }) => [`domain:${domain}`],
          children: {
            data: { tags: 'type:data' },
            'feat-{type}': { tags: 'type:feature' },
          },
        },
      },
    },
  },
  depRules: {
    'domain:*': [({ from, to }) => from === to, 'shared'],
    'type:feature': 'type:data',
    'type:data': null,
    shared: null,
  },
};
