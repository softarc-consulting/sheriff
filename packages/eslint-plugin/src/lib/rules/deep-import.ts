import { hasDeepImport } from '@softarc/sheriff-core';
import { createRule } from './create-rule';

export const deepImport = createRule(
  'Deep Import',
  (context, node, isFirstRun, filename, sourceCode) => {
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
