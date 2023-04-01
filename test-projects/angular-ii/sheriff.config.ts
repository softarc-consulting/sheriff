import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app': {
      '+state': 'app:state',
      'domains/shared/{type}': 'shared',
      'domains/{domain}/{type}': ({ domain, type }) => {
        const tags = [`domain:${domain}`];
        if (type === 'data') {
          tags.push('type:data');
        } else if (type.startsWith('feature')) {
          tags.push('type:feature');
        } else if (type.startsWith('ui')) {
          tags.push('type:ui');
        }
        return tags;
      },
      shell: 'app:shell',
    },
  },
  depRules: {
    root: ['app:state', 'app:shell', 'type:feature', 'shared'],
    'domain:*': [({ from, to }) => from === to, 'shared'],
    shared: 'shared',
    'type:feature': ['type:feature', 'type:data', 'type:ui'],
    'type:ui': ['type:data'],
    'type:data': [],
  },
};
