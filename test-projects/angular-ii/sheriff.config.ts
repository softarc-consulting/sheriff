import { noDependencies, sameTag, SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app': {
      '+state': 'app:state',
      'domains/shared/<type>': 'shared',
      'domains/<domain>': {
        data: ['domain:<domain>', 'type:data'],
        'feature-<feature>': ['domain:<domain>', 'type:feature'],
        'ui-<ui>': ['domain:<domain>', 'type:ui'],
      },
      shell: 'app:shell',
    },
  },
  depRules: {
    root: ['app:shell', 'app:state', 'type:feature', 'shared'],
    'domain:*': [sameTag, 'shared'],
    shared: 'shared',
    'type:*':'shared',
    'type:feature': ['type:feature', 'type:data', 'type:ui'],
    'type:ui': ['type:data'],
    'type:data': noDependencies,
  },
};
