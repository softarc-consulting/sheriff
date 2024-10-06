export type ModulePathPatternsTree = {
  [basePath: string]: ModulePathPatternsTree;
};

/**
 * Create a tree structure from a list of module path patterns.
 *
 * Having a tree structure improves the performance because shared
 * parent directories only have to be read once.
 *
 * For example, given the following patterns:
 * ```typescript
 * ['src/app/feat-*-module/*', 'src/app/services/*', 'src/app/shared/*']
 * ```
 *
 * would end up in the following tree:
 * ```typescript
 * {
 *   src: {
 *     app: {
 *       feat-*-module: {},
 *       services: {},
 *       shared: {}
 *     }
 *   }
 * }
 * ```
 */
export function createModulePathPatternsTree(
  patterns: string[],
): ModulePathPatternsTree {
  const flatTree: Record<string, string[]> = {};

  for (const pattern of patterns) {
    const parts = pattern.split('/');
    const basePath = parts[0]; // Get the top-level directory (e.g., "src")

    const restOfPattern = parts.slice(1).join('/'); // Remove the top-level part

    if (!flatTree[basePath]) {
      flatTree[basePath] = [];
    }

    flatTree[basePath].push(restOfPattern || '');
  }

  // group next subdirectories
  const tree: ModulePathPatternsTree = {};
  for (const basePath in flatTree) {
    const subPatterns = flatTree[basePath];
    if (subPatterns.length === 1 && subPatterns[0] === '') {
      tree[basePath] = {};
    } else {
      tree[basePath] = createModulePathPatternsTree(subPatterns);
    }
  }
  return tree;
}
