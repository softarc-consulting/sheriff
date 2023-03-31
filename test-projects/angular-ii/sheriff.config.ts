import {SheriffConfig} from "@softarc/sheriff-core";

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    "src/app": {
      children: {
        "+state": {tags: "app:state"},
        "domains/shared/${type}": {
          tags: "shared"
        },
        "domains/${domain}/${type}": {
          tags: (_, {placeholders: {domain, type}}) => {
            const tags = [`domain:${domain}`];
            if (type === 'data') {
              tags.push('type:data')
            } else if (type.startsWith('feature')) {
              tags.push('type:feature')
            } else if (type.startsWith('ui')) {
              tags.push('type:ui')
            }
            return tags;
          }
        }
      }
    }
  },
  depRules: {
    'root': ['app:state', 'type:feature'],
    'domain:*': [({from, to}) => from === to, 'domain:shared'],
    'type:feature': ['type:data', 'type:ui'],
    'type:data': [],
    'type:ui': [],
  }

}
