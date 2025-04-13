// @ts-check
const tseslint = require('typescript-eslint');
const sheriff = require('@softarc/eslint-plugin-sheriff');

module.exports = tseslint.config({
  files: ['**/*.ts'],
  extends: [sheriff.configs.all],
});
