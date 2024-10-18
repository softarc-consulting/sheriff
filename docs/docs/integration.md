---
sidebar_position: 6
title: Integration into large projects
displayed_sidebar: tutorialSidebar
---
It is usually not possible to modularize an existing codebase at once. Instead, we have to integrate Sheriff
incrementally.

Next to [automatic tagging](./dependency-rules#automatic-tagging), we introduce modules step by step.

## With barrel-less modules

The recommended approach is start with only one module. For example `holidays/feature`. Encapsulated files of that modules need to be moved to the `internals` folder. If `holidays/feature` is barrel-less, it can access `root`, given the dependency rules allow access to tag `root`.

By default, barrel-less modules are disabled. They have to be enabled in `sheriff.config.ts` via `enableBarrelLess: true`.

## Without barrel-less modules

If Sheriff only supports barrel modules, then the integration would still progress module by module. `holidays/feature` gets an `index.ts` and defines its exposed files. Since `root` would be barrel-less, `holidays/feature` cannot access it.

```mermaid
flowchart LR
  holidays/feature/holidays.component.ts -- fails -->holidays/data/holidays-data.service.ts
  app.config.ts -- succeeds -->holidays/feature/holidays.component.ts
  subgraph root
    holidays/data/holidays-data.service.ts
    app.config.ts
    main.ts
    app.component.ts
    core/header.component.ts
    core/footer.component.ts
    holidays/data/internal.service.ts
  end
  subgraph "type:feature (holidays/feature)"
    holidays/feature/index.ts
    holidays/feature/holidays.component.ts
  end


  style holidays/feature/index.ts stroke: #333, stroke-width: 4px
  style root fill: #f9f9f9
  style holidays/data/holidays-data.service.ts fill:coral
  style app.config.ts fill:lightgreen
```

There is a special property for this use case: `excludeRoot`. Once set to `true`, all modules can access all files in the root module.

```typescript
export const config: SheriffConfig = {
  excludeRoot: true, // <-- set this
  modules: {
    'src/shared': 'shared',
  },
  depRules: {
    root: 'noTag',
    noTag: ['noTag', 'root'],
    shared: anyTag,
  },
};
```

```mermaid
flowchart LR
  holidays/feature/holidays.component.ts  --> holidays/data/holidays-data.service.ts
  app.config.ts --> holidays/feature/holidays.component.ts
  subgraph root
    holidays/data/holidays-data.service.ts
    app.config.ts
    main.ts
    app.component.ts
    core/header.component.ts
    core/footer.component.ts
    holidays/data/internal.service.ts
  end
  subgraph "type:feature (holidays/feature)"
    holidays/feature/index.ts
    holidays/feature/holidays.component.ts
  end


  style holidays/feature/index.ts stroke: #333, stroke-width: 4px
  style root fill: #f9f9f9
  style holidays/data/holidays-data.service.ts fill:lightgreen
  style app.config.ts fill:lightgreen
```

---

Please note that the `excludeRoot` property only makes sense with `enableBarrelLess: false`.
