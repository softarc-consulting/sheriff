---
sidebar_position: 5
title: CLI
displayed_sidebar: tutorialSidebar
---

The core package (@softarc/sheriff-core) comes with a CLI to initialize the configuration file, list modules, check the rules and export the dependency graph in JSON format.

## `init`

Run `npx sheriff init` to create a `sheriff.config.ts`. Its configuration runs with [automatic tagging](./dependency-rules#automatic-tagging), meaning no dependency rules are in place, and it only checks for the module boundaries.

## `verify [main.ts]`

Run `npx sheriff verify main.ts` to check if your project violates any of your rules. `main.ts` is in this case the entry file for Sheriff.

See [Entry Files and Entry Points](#entry-files-and-entry-points) for configuration options.

## `list [main.ts]`

Run `npx sheriff list main.ts` to print out all your modules along their tags.

See [Entry Files and Entry Points](#entry-files-and-entry-points) for configuration options.

## `export [main.ts]`

Run `npx sheriff export main.ts > export.json` to export the dependency graph in JSON format. The dependency graph includes all reachable files. For every file, it will include the assigned module as well as the tags.

See [Entry Files and Entry Points](#entry-files-and-entry-points) for configuration options.

## Entry Files and Entry Points

Sheriff needs to know where to start traversing your project's imports. You can specify this using either an `entryFile` **or** `entryPoints`.

### Entry File

An entry file is a single file that serves as the starting point for Sheriff's analysis. It's typically your application's main entry point.

Depending on your project, you will likely have a different entry file. For example, with an Angular CLI-based project it would be `src/main.ts`.

**Usage with CLI:**

```bash
npx sheriff verify main.ts
npx sheriff list src/main.ts
npx sheriff export src/main.ts > export.json
```

**Usage with configuration:**
You can set the `entryFile` property in `sheriff.config.ts`:

```typescript
export const config: SheriffConfig = {
  entryFile: './src/main.ts',
  // ... other configuration
};
```

When `entryFile` is set in the configuration, you can omit it from the CLI commands:

```bash
npx sheriff verify
npx sheriff list
npx sheriff export > export.json
```

### Entry Points

Entry points allow you to specify multiple named entry files, useful for workspaces with multiple applications.

**Configuration:**
Define `entryPoints` in `sheriff.config.ts`:

```typescript
export const config: SheriffConfig = {
  entryPoints: {
    'app-web': './apps/web/src/main.ts',
    'app-mobile': './apps/mobile/src/main.ts',
    'app-admin': './apps/admin/src/main.ts',
  },
  // ... other configuration
};
```

**Usage with CLI:**

```bash
# Check specific entry points
npx sheriff verify app-web,app-mobile
npx sheriff list app-admin
npx sheriff export app-web,app-mobile,app-admin > export.json

# If only one entry point is defined, you can omit it
npx sheriff verify
```

### Priority

When both `entryFile` and `entryPoints` are specified in the configuration, Sheriff will throw an error.

CLI arguments take precedence over configuration
