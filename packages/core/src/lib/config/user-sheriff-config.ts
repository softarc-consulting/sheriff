import { ModuleConfig } from './module-config';
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
 *   modules: {
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
 *   modules: {
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
export interface UserSheriffConfig {
  /**
   * Tagging is not mandatory, if autoTagging is enabled (by default).
   *
   * @deprecated Use `modules` instead.
   */
  tagging?: ModuleConfig;

  /**
   * Defines the modules and their associated tags.
   *
   * Expects an object where keys represent the module paths, and each module
   * requires one or more tags.
   *
   * __Example:__
   *
   * Given a project structure where `feature-1` and `feature-2` are modules:
   *
   * <pre>
   * main.ts
   * feature-1
   *   ├── feature1.ts
   *   └── internal
   *       ├── client.ts
   *       └── services.ts
   * feature-2
   *   ├── feature2.ts
   *   └── internal
   *       └── feature2-helper.ts
   * </pre>
   *
   * The configuration for `modules` would look like this:
   *
   * ```typescript
   * {
   *   modules: {
   *     'feature-1': ['type:feature', 'scope:global'],
   *     'feature-2': 'type:feature2'
   *   }
   * }
   * ```
   *
   * In this example, the `internal` folder encapsulates files, meaning they are
   * not accessible outside the module.
   *
   * The assigned tags can also be used to enforce dependency rules, {@link #depRules}.
   *
   * If the {@link #autoTagging} property is enabled, the `modules` configuration is optional.
   */
  modules?: ModuleConfig;

  /**
   * Assigns the tag "**noTag**" to all untagged barrel-modules (modules with an `index.ts`).
   * Set to `true` by default.
   */
  autoTagging?: boolean;

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
   *   modules: {
   *     "src/shared": "shared",
   *   },
   *   depRules: {
   *     "*": () => true
   *   }
   * }
   * ```
   */
  excludeRoot?: boolean;

  /**
   * The barrel file is usually the `index.ts` and exports
   * those files which are available outside the module.
   */
  barrelFileName?: string;

  /**
   * The barrel-less approach means that the module
   * does not have an `index.ts` file. Instead, all files
   * are directly available, except those which are located
   * in a special folder ("internal" be default).
   */
  enableBarrelLess?: boolean;

  /**
   * The encapsulated folder contains all files
   * which are not available outside the module.
   * By default, it is set to `internal`.
   *
   * @deprecated use {@link encapsulationPatternForBarrelLess} instead
   */
  encapsulatedFolderNameForBarrelLess?: string;

  /**
   * By default, it is set to `internal`, meaning
   * all files within the subfolder `internal` of
   * a module are encapsulated.
   *
   * You can choose a string value, a global value
   * or a regex to define the location/pattern for
   * encapsulation in barrel-less modules.
   *
   * Example with a simple string:
   *
   * <code>
   *
   * </code>
   *
   * This is a more powerful alternative to
   * {@link encapsulatedFolderNameForBarrelLess}.
   */
  encapsulationPatternForBarrelLess?: string

  /**
   * @deprecated no warning is shown.
   */
  showWarningOnBarrelCollision?: boolean

  /**
   * enable internal logging and save it to `sheriff.log`
   */
  log?: boolean;

  /**
   * The file that the CLI should use by default.
   */
  entryFile?: string;
}
