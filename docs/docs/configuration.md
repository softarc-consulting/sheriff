---
sidebar_position: 4
title: Configuration Reference
displayed_sidebar: tutorialSidebar
---

This page provides a comprehensive reference for all configuration options available in Sheriff. The configuration is defined in a `sheriff.config.ts` file located in your project's root directory.

> **💡 Quick Start**: Use `npx sheriff init` to automatically generate a `sheriff.config.ts` file with sensible defaults. See the [CLI documentation](./cli.md) for more details.

## Configuration Structure

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  // Your configuration options here
};
```

## Mandatory Options

These options are required for Sheriff to function properly. You need to understand and configure these for Sheriff to work effectively.

### `modules` {#modules}

- **Type**: `ModuleConfig`
- **Description**: Defines the modules and assigns tags. This is the primary way to structure your project. If you don't define modules, you must enable `autoTagging` for Sheriff to work. See [Module Boundaries](./module_boundaries.md) for detailed examples.

### `depRules` {#deprules}

- **Type**: `DependencyRulesConfig`
- **Description**: Defines dependency rules between modules. Even with defaults, you should understand how this affects your project structure. See [Dependency Rules](./dependency-rules.md) for detailed examples.

## Optional Options

These options have sensible defaults and are typically only customized for specific use cases.

### Recommended Options

#### `entryFile` {#entryfile}

- **Type**: `string`
- **Default**: `''`
- **Description**: Single entry file path for Sheriff to start traversing imports. Cannot be used together with `entryPoints`.

#### `entryPoints` {#entrypoints}

- **Type**: `Record<string, string>`
- **Default**: `undefined`
- **Description**: Multiple named entry points for workspaces with multiple applications. Cannot be used together with `entryFile`.

**Recommendations:**

- **Use `entryFile`** for single applications or simple projects
- **Use `entryPoints`** for monorepos, workspaces, or projects with multiple applications
- **Example monorepo structure:**
  ```typescript
  entryPoints: {
    'app-web': './apps/web/src/main.ts',
    'app-mobile': './apps/mobile/src/main.ts',
    'lib-shared': './libs/shared/src/index.ts'
  }
  ```

### Other Options

#### `autoTagging` {#autotagging}

- **Type**: `boolean`
- **Default**: `true`
- **Description**: When enabled, Sheriff automatically detects modules and assigns the `noTag` tag to them. Useful for initial setup, but becomes optional when you define explicit `modules`.

#### `enableBarrelLess` {#enablebarrelless}

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enables barrel-less modules where files are directly available except those in the `internal` folder.

#### `encapsulationPattern` {#encapsulationpattern}

- **Type**: `string`
- **Default**: `'internal'`
- **Description**: Name of the folder that contains encapsulated files not available outside the module.

#### `barrelFileName` {#barrelfilename}

- **Type**: `string`
- **Default**: `'index.ts'`
- **Description**: Name of the barrel file that exports public APIs from a module.

#### `ignoreFileExtensions` {#ignorefileextensions}

- **Type**: `string[] | ((defaults: string[]) => string[])`
- **Default**: See [Default Ignored Extensions]
- **Description**: Controls which file extensions are ignored during import traversal. Sheriff will not follow imports to files with these extensions.

<details>
<summary>Default Ignored Extensions</summary>

**Default Ignored Extensions:**

- **Images**: `svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `ico`
- **Styles**: `css`, `scss`, `sass`, `less`
- **Fonts**: `woff`, `woff2`, `ttf`, `eot`, `otf`
- **Audio**: `mp3`, `wav`, `ogg`
- **Video**: `mp4`, `webm`, `mov`
- **Data/Misc**: `json`, `csv`, `xml`, `txt`, `md`

</details>

#### `excludeFromChecks` {#excludefromchecks}

- **Type**: `(string | RegExp)[]`
- **Default**: `[]`
- **Description**: Patterns to exclude from ALL Sheriff rule enforcement. Files matching these patterns are still processed and traversed for dependency analysis, but no rule violations are reported. Supports glob patterns and regular expressions.

**Key Distinction: `ignoreFileExtensions` vs `excludeFromChecks`**

The `ignoreFileExtensions` option makes Sheriff skip parsing and traversing certain file types, such as `.scss`, because the TypeScript parser cannot read them. This means dependencies inside those files are completely hidden from Sheriff.

In contrast, `excludeFromChecks` disables rule enforcement for specific paths while still parsing and traversing them. Excluded files themselves are not checked, but any files they import remain visible to Sheriff. This ensures that non-excluded code imported through excluded paths is still validated.

**Examples:**

```typescript
export const config: SheriffConfig = {
  excludeFromChecks: [
    'src/client/**',           // Skip all rule checks for generated client
    'src/generated/**',        // Skip all rule checks for generated files
    'src/**/*.gen.ts',         // Skip all rule checks for .gen.ts files
    /src\/.*\.gen\.ts$/,       // Regex pattern for .gen.ts files
    'src/legacy/**'            // Skip all rule checks for legacy code
  ],
  // ... other config options
};
```

**Use Cases:**

- **Legacy code migration**: Existing codebases that haven't been refactored to follow strict module boundaries yet need time to gradually adopt Sheriff's rules
- **Third-party generated code**: Users import from generated SDKs or client libraries that have internal dependencies (e.g., OpenAPI clients)
- **Temporary exclusions**: During refactoring phases where certain areas need to be temporarily excluded from rule enforcement

### Legacy Options

#### `excludeRoot` {#excluderoot}

- **Type**: `boolean`
- **Default**: `false`
- **Description**: When enabled, removes the implicit root project from all checks. Useful for incremental integration of Sheriff into existing applications.

#### `log` {#log}

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enables detailed logging for debugging purposes.

#### `version` {#version}

- **Type**: `number`
- **Default**: `1`
- **Description**: Configuration version. Currently only version 1 is supported. This option is rarely needed as Sheriff automatically uses the latest supported version.

## Configuration Validation

Sheriff validates your configuration and will throw helpful errors if:

- Both `entryFile` and `entryPoints` are specified
- `autoTagging` is disabled but no `modules` are defined
- Invalid dependency rules are configured
- Required properties are missing

## Migration from Previous Versions

If you're upgrading from an older version of Sheriff, check the [Release Notes](./release-notes/) for any breaking changes or new configuration options.

Generally speaking, we really try hard to avoid breaking changes.
