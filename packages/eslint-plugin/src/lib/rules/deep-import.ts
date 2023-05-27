import { Rule } from 'eslint';
import { hasDeepImport } from '@softarc/sheriff-core';
import { ImportDeclaration, ImportExpression } from 'estree';

const executeRule = (
  context: Rule.RuleContext,
  node: ImportExpression | ImportDeclaration,
  isFirstRun: boolean
) => {
  // ESTree does not have source on `ImportExpression`.
  const importValue = (node.source as { value: string }).value;
  try {
    if (hasDeepImport(context.getFilename(), importValue, isFirstRun)) {
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
    let isFirstRun = true;
    const executeRuleWithContext = (
      node: ImportExpression | ImportDeclaration
    ) => {
      executeRule(context, node, isFirstRun);
      isFirstRun = false;
    };
    return {
      ImportExpression: executeRuleWithContext,
      ImportDeclaration: executeRuleWithContext,
    };
  },
};
