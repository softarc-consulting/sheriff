import { TagConfig } from './tag-config';
import { DependencyRulesConfig } from './dependency-rules-config';

/**
 * Exported by **sheriff.config.ts**. It is optional and should be located
 * in the project's root directory.
 *
 * If it does not exist, only the deep-import rule is active.
 *
 * ## Examples:
 *
 * __Classic layered architecture__
 *
 * ```typescript
 * import { SheriffConfig } from '@softarc/sheriff-core';
 *
 * export const config: SheriffConfig = {
 *   tags: {
 *     src: {
 *       db: 'db',
 *       logic: 'logic',
 *       ui: 'ui'
 *     }
 *   },
 *   depRules: {
 *     ui: 'logic',
 *     logic: 'db'
 *   }
 * }
 * ```
 *
 * __Angular CLI with feature modules and placeholders__
 *
 * ```typescript
 * import { anyTag, SheriffConfig } from '@softarc/sheriff-core';
 *
 * export const config: SheriffConfig = {
 *   tags: {
 *     'src/app': {
 *       'feature/<feature>': 'feature:<feature>',
 *       'shared': 'shared'
 *     }
 *   },
 *   depRules: {
 *     'feature:*': 'shared'
 *   }
 * }
 * ```
 */
export interface SheriffConfig {
  tagging: TagConfig;
  depRules: DependencyRulesConfig;
  // optional property. Has the value `1` by default.
  version?: number;
  /**
   * Remove the implicit root project from all checks. Useful for an
   * incremental integration of Sheriff into an existing application.
   *
   * The root project is implicitly generated, if the project's
   * root folder has no **index.ts** and also applies to all
   * its subfolders without **index.ts**.
   *
   * __Example__
   *
   * <pre>
   * - main.ts
   * - router.ts
   * - config.ts
   * shared
   *   - get.ts
   *   - dialog.ts
   *   - index.ts
   * customers
   *   - customer-component.ts
   * holidays
   *   - holidays-component.ts
   *   - holidays-loader.ts
   * </pre>
   *
   * In this example, **./shared** has an **index.ts** and acts as module.
   * The rest is part of the implicit root app.
   *
   * Without `excludeRoot` (default set to `false`), all files within
   * **./shared** cannot import from root. Files from root can import
   * from **./shared** following the rules for deep-import dependencies rules.
   *
   * With `excludeRoot: true`, **./shared** can directly access any file
   * from root. deep-import and dependencies rules do not apply.
   *
   * As for the configuration, you can use this example:
   *
   * ```typescript
   * export const config: SheriffConfig = {
   *   excludeRoot: true,
   *   tags: {
   *     "src/shared": "shared",
   *   },
   *   depRules: {
   *     "*": () => true
   *   }
   * }
   * ```
   */
  excludeRoot?: boolean;
}
