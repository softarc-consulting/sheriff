import { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  create: (context) => {
    console.log('starting sheriff...');
    return {
      Literal: (node) => {
        context.report({
          message: '😿',
          node,
        });
      },
    };
  },
};

export default rule;
