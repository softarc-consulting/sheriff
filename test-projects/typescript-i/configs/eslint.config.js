// @ts-check
const tseslint = require('typescript-eslint');
const sheriff = require('@sheriff-arch/eslint-plugin-sheriff');

module.exports = tseslint.config({
  files: ['**/*.ts'],
  languageOptions: { parser: tseslint.parser },
  extends: [sheriff.configs.all],
});
