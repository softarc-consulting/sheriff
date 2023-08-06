import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: { 'src/<type>': '<type>' },
  depRules: {
    root: 'web',
    data: '',
    logic: 'data',
    web: 'logic',
  },
};
