export default {
  default: {
    parser: '@typescript-eslint/parser',

    plugins: ['@sheriff'],
    rules: {
      '@sheriff/no-literal': 'warn',
    },
  },
};
