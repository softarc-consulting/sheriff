import { violatesEncapsulationRule } from '@softarc/sheriff-core';
import { createRule } from './utils/create-rule';
import { excludeSheriffConfig } from './utils/file-filter';
export const encapsulation = createRule(
  'Encapsulation',
  excludeSheriffConfig,
  (context, node, isFirstRun, filename, sourceCode) => {
    const importValue = (node.source as { value: string }).value;
    const message = violatesEncapsulationRule(
      filename,
      importValue,
      isFirstRun,
      sourceCode,
      false,
    );
    if (message) {
      context.report({
        message,
        node,
      });
    }
  },
);
