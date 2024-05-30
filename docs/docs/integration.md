---
sidebar_position: 6
title: Integration into large projects
---
It is usually not possible to modularize an existing codebase at once. Instead, we have to integrate Sheriff
incrementally.

Next to [automatic tagging](./dependency-rules#automatic-tagging), we introduce manual tagged modules step by step.

The recommended approach is start with only one module. For example _holidays/feature_. All files from the outside have
to import from the module's _index.ts_, and it has the tags "type:feature".

It is very likely that _holidays/feature_ depends on files in the "root" module. Since "root" doesn't have
an **index.ts**, no other module can depend on it:

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

We can disable the deep import checks for the **root** module by setting `excludeRoot` in _sheriff.config.ts_ to `true`:

```typescript
export const config: SheriffConfig = {
  excludeRoot: true, // <-- set this
  tagging: {
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

Once all files from "root" import form **shared's** _index.ts_, create another module and do the same.
