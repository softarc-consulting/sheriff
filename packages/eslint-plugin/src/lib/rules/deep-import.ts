import { violatesEncapsulationRule } from '@softarc/sheriff-core';
import { createRule } from './utils/create-rule';
import { excludeSheriffConfig } from './utils/file-filter';

export const deepImport = createRule(
  'Deep Import',
  excludeSheriffConfig,
  (context, node, isFirstRun, filename, sourceCode) => {
    const importValue = (node.source as { value: string }).value;
    const message = violatesEncapsulationRule(
      filename,
      importValue,
      isFirstRun,
      sourceCode,
      true,
    );
    if (message) {
      context.report({
        message,
        node,
      });
    }
  },
);
