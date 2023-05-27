import { noDependencies, sameTag, SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app': {
      'shared/<type>': 'shared:<type>',
      bookings: ['domain:bookings', 'type:feature'],
      'customers/api': ['type:api', 'domain:customers:api'],
      '<domain>/<type>': ['domain:<domain>', 'type:<type>'],
    },
  },
  depRules: {
    root: ['type:feature', 'shared:*'],
    'domain:*': sameTag,
    'domain:bookings': 'domain:customers:api',
    'domain:customers:api': 'domain:customers',
    'type:api': 'type:*',
    'type:feature': [
      'type:*',
      'shared:config',
      'shared:form',
      'shared:master-data',
      'shared:ngrx-utils',
      'shared:util',
    ],
    'type:data': [
      'type:model',
      'shared:http',
      'shared:ngrx-utils',
      'shared:ui-messaging',
    ],
    'type:ui': ['type:model', 'shared:form', 'shared:ui'],
    'type:model': noDependencies,
    'shared:http': ['shared:config', 'shared:ui-messaging'],
    'shared:ngrx-utils': ['shared:util'],
  },
};
