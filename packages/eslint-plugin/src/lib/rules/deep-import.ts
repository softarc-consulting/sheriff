import { Rule } from 'eslint';
import { hasDeepImport } from '@sheriff/core';

const rule: Rule.RuleModule = {
  create: (context) => {
    return {
      ImportDeclaration: (node) => {
        if (
          hasDeepImport(context.getFilename(), String(node.source.value) || '')
        ) {
          context.report({ message: 'import error', node });
        }
      },
    };
  },
};

export default rule;
