const angularCliConfig = {
  'src/app': {
    dirs: {
      'domain/{domain}/{type}': {
        tags: (_, { domain, type }) => [`domain:${domain}`, `type:${type}`],
      },
      'shared/{libName}': {
        tag: 'domain:shared',
      },
    },
  },
};

const nxConfig = {
  'apps/flight-app/src/app': {
    dirs: {
      'domain/{domain}/{type}': {
        tags: (_, { domain, type }) => [`domain:${domain}`, `type:${type}`],
      },
      'shared/{libName}': {
        tag: 'domain:shared',
      },
    },
  },
  'libs/shared/{lib}': {
    tags: ['domain:shared'],
  },
  'libs/{domain}/{type}': {
    tags: (_, placeholder) => [
      `domain:${placeholder.domain}`,
      `type:${placeholder.type}`,
    ],
  },
};
