import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  entryPoints: {
    'app-i': 'projects/app-i/src/main.ts',
    'app-ii': 'projects/app-ii/src/main.ts',
  },
  enableBarrelLess: true,
  showWarningOnBarrelCollision: false,
  modules: {
    'projects/app-i': {
      'src/app/non-compliant/data-access': ['type:data-access'],
      'src/app/non-compliant/feat': ['type:feat'],
      'src/app/non-compliant/types': ['type:types'],
      'src/app/non-compliant/ui': ['type:ui'],
      'src/app/non-compliant/util': ['type:util'],
    },
    'projects/app-ii': {
      'src/app/non-compliant/data-access': ['type:data-access'],
      'src/app/non-compliant/feat': ['type:feat'],
      'src/app/non-compliant/types': ['type:types'],
      'src/app/non-compliant/ui': ['type:ui'],
      'src/app/non-compliant/util': ['type:util'],
    },
  },
  depRules: {
    root: 'noTag',
    noTag: ['noTag', 'root'],
    'type:feat': ['type:ui', 'type:types', 'type:data-access', 'type:util'],
    'type:ui': ['type:ui', 'type:types', 'type:util'],
    'type:util': ['type:types', 'type:util'],
    'type:types': ['type:types'],
    'type:data-access': ['type:types', 'type:util', 'type:data-access'],
  },
};
