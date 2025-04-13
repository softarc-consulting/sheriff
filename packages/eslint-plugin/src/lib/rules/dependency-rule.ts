import { violatesDependencyRule } from '@softarc/sheriff-core';
import { createRule } from './utils/create-rule';

export const dependencyRule = createRule(
  'Dependency Rule',
  (context, node, isFirstRun, filename, sourceCode) => {
    const importValue = (node.source as { value: string }).value;
    const message = violatesDependencyRule(
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
