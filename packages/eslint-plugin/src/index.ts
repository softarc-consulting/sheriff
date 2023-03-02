import configs from './lib/config';
import noLiteral from '../../eslint-plugin/src/lib/rules/no-literal';

export = {
  rules: {
    'no-literal': noLiteral,
  },
  configs,
};
