import { Rule } from 'eslint';
import { violatesDependencyRule } from '@softarc/sheriff-core';
import { ImportDeclaration, ImportExpression } from 'estree';
import { createRule } from './create-rule';

export const dependencyRule = createRule(
  'Dependency Rule',
  (
    context: Rule.RuleContext,
    node: ImportExpression | ImportDeclaration,
    isFirstRun: boolean,
    filename: string,
    sourceCode: string
  ) => {
    const importValue = (node.source as { value: string }).value;
    const message = violatesDependencyRule(
      filename,
      importValue,
      isFirstRun,
      sourceCode
    );
    if (message) {
      context.report({
        message,
        node,
      });
    }
  }
);
