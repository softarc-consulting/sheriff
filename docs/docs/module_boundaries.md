---
sidebar_position: 3
title: Module Boundaries
displayed_sidebar: tutorialSidebar
---
There are two types of modules: **Barrel Modules**, which include an `index.ts` file in their root folder, and **Barrel-less Modules**. Barrel-less modules require a configuration file, while barrel modules do not.

The recommendation is for barrel-less modules because they optimize tree-shaking.

A project allows both module types. However, if a module, configured as barrel-less, contains a barrel file, it becomes a barrel module.

## Barrel-less Modules

Barrel-less modules have a subdirectory `internal`. All files in that subdirectory `internal` are encapsulated, i.e. other modules cannot access them.

The configuration file `sheriff.config.ts` defines these modules. The CLI command `npx sheriff init` generates the configuration automatically with the following content:

```typescript
export const config: SheriffConfig = {
  modules: {},
  depRules: {
    root: 'noTag',
    noTag: 'noTag',
  },
};
```

The `depRules` can stay as they are. They allow all modules to access each other.

The `modules` object defines the modules. The key is a directory path relative to the project root. The value is a string or an array of strings, defining the tags of the module.

For example, the current project has the directories _db_ and _web_. `modules` defines them as follows:

```typescript
export const config: SheriffConfig = {
  modules: {
    db: 'noTag',
    web: 'noTag'
  },
  enableBarrelLess: true, // <-- this is important
  depRules: {
    root: "noTag",
    noTag: "noTag"
  }
};
```

Again, the value `noTag` means that there is no restriction on which modules can access each other.

The `web` module has a dependency on `db`. The file `fetcher.ts` in `web` imports `db.ts` from `db`. This is a valid import because `db.ts` is not located in the `internal` directory of `db`.

Therefore, ESLint does not show any errors.

<img width="1905" alt="Valid Import" src="../img/module-boundaries-barrel-less-valid.png"></img>

However, if `fetcher.ts` accesses `credentials.ts` from `db`, ESLint will show an error. This results in an encapsulation violation because `credentials.ts` is located in the `internal` directory of `db`.

<img width="1905" alt="Invalid Import" src="../img/module-boundaries-barrel-less-invalid.png"></img>

## Barrel Modules

Barrel modules have an `index.ts` in their root folder. Sheriff detects them automatically, even if `modules` in `sheriff.config.ts` doesn't define them.

The `index.ts` file exports the files that other modules can access. The files that are not exported are encapsulated.

Since Sheriff detects them automatically, no configuration file is necessary. However, if a `sheriff.config.ts` exists, the initial content from the CLI is enough.

```typescript
export const config: SheriffConfig = {
  depRules: {
    root: 'noTag',
    noTag: 'noTag',
  },
};
```

The screenshot below shows the same example with `db` and `web` as barrel modules. `db` has an `index.ts` that exports `db.ts`. `credential.ts` is not in an `internal` folder but is still encapsulated because it is not exported.

<img width="1905"src="../img/module-boundaries-barrel-file.png"></img>

`fetcher.ts` accessing `db.ts` causes therefore no error.

<img width="1905"src="../img/module-boundaries-barrel-valid.png"></img>

An access to the non-exported `credential.ts` causes an error.

<img width="1905"src="../img/module-boundaries-barrel-invalid.png"></img>

---

It is also possible to disable the automatic module detection. For more information, see [Dependency Rules](./dependency-rules.md#automatic-tagging).
