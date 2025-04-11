module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'optional',
      ['core', 'eslint-plugin', 'docs', 'test-projects'],
    ],
  },
};
