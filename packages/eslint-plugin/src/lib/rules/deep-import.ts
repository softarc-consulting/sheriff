import { Rule } from 'eslint';
import { hasDeepImport } from '@softarc/sheriff-core';
import { ImportDeclaration, ImportExpression } from 'estree';

const executeRule = (
  context: Rule.RuleContext,
  node: ImportExpression | ImportDeclaration
) => {
  // ESTree does not have source on `ImportExpression`.
  const importValue = (node.source as { value: string }).value;
  try {
    if (hasDeepImport(context.getFilename(), importValue)) {
      context.report({
        message:
          "Deep import is not allowed. Use the module's index.ts or path.",
        node,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      context.report({
        message: `Deep Import (internal error): ${error.message}`,
        node,
      });
    } else {
      context.report({
        message: String(error),
        node,
      });
    }
  }
};

export const deepImport: Rule.RuleModule = {
  create: (context) => {
    const executeRuleWithContext = (
      node: ImportExpression | ImportDeclaration
    ) => executeRule(context, node);
    return {
      ImportExpression: executeRuleWithContext,
      ImportDeclaration: executeRuleWithContext,
    };
  },
};
