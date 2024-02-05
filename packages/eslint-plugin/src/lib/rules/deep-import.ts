import { Rule } from 'eslint';
import { hasDeepImport } from '@softarc/sheriff-core';
import { ImportDeclaration, ImportExpression } from 'estree';
import { createRule } from './create-rule';

export const deepImport = createRule(
  'Deep Import',
  (
    context: Rule.RuleContext,
    node: ImportExpression | ImportDeclaration,
    isFirstRun: boolean,
    filename: string,
    sourceCode: string,
  ) => {
    // ESTree does not have source on `ImportExpression`.
    const importValue = (node.source as { value: string }).value;
    const message = hasDeepImport(
      filename,
      importValue,
      isFirstRun,
      sourceCode,
    );
    if (message) {
      context.report({
        message,
        node,
      });
    }
  },
);
