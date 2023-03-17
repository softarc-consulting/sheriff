import { Rule } from 'eslint';
import { hasDeepImport } from '@softarc/sheriff-core';

const rule: Rule.RuleModule = {
  create: (context) => {
    let firstRun = true;
    return {
      ImportDeclaration: (node) => {
        if (
          hasDeepImport(
            context.getFilename(),
            String(node.source.value) || '',
            firstRun
          )
        ) {
          context.report({
            message:
              "Deep import is not allowed. Use the module's index.ts or path.",
            node,
          });
        }
        firstRun = false;
      },
    };
  },
};

export default rule;
