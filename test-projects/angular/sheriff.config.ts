import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app': {
      children: {
        shared: {
          tags: ['domain:shared'],
        },
        '{domain}': {
          tags: (_, { placeholders: { domain } }) => [`domain:${domain}`],
          children: {
            '+state': { tags: ['type:data'] },
          },
        },
      },
    },
  },
  depRules: { 'domain:*': ({ from, to }) => from === to },
};
