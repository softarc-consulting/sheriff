export default {
  default: {
    parser: '@typescript-eslint/parser',
    plugins: ['@softarc/sheriff'],
    rules: {
      '@softarc/sheriff/deep-import': 'error',
    },
  },
};
