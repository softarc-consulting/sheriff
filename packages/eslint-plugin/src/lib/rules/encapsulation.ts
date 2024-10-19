import { violatesEncapsulationRule } from '@softarc/sheriff-core';
import { createRule } from './create-rule';

export const encapsulation = createRule(
  'Encapsulation',
  (context, node, isFirstRun, filename, sourceCode) => {
    const importValue = (node.source as { value: string }).value;
    const message = violatesEncapsulationRule(
      filename,
      importValue,
      isFirstRun,
      sourceCode,
      false
    );
    if (message) {
      context.report({
        message,
        node,
      });
    }
  },
);
