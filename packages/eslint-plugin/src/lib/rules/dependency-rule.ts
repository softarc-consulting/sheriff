import { Rule } from 'eslint';
import { violatesDependencyRule } from '@softarc/sheriff-core';
import { ImportDeclaration, ImportExpression } from 'estree';
import { isFirstRun } from 'vitest';

const executeRule = (
  context: Rule.RuleContext,
  node: ImportExpression | ImportDeclaration,
  isFirstRun: boolean
) => {
  try {
    const importValue = (node.source as { value: string }).value;
    const message = violatesDependencyRule(
      context.getFilename(),
      importValue,
      isFirstRun
    );
    if (message) {
      context.report({
        message,
        node,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      context.report({
        message: `Dependency Rule (internal error): ${error.message}`,
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

export const dependencyRule: Rule.RuleModule = {
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
