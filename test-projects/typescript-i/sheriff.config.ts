import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: { 'src/<type>': '<type>' },
  depRules: {
    data: '',
    logic: 'data',
    web: 'logic',
  },
};
