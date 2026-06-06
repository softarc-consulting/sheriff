// @ts-check
const tseslint = require('typescript-eslint');
const sheriff = require('@softarc/eslint-plugin-sheriff');

module.exports = tseslint.config({
  files: ['src/**/*.ts'],
  extends: [sheriff.configs.all],
});
