---
sidebar_position: 4
title: Dependency Rules
displayed_sidebar: tutorialSidebar
---

## Introduction
Dependency rules determine which modules can access each other. Since managing dependencies on a per-module basis doesn't scale well, Sheriff utilizes tags to group modules together. Dependency rules are then defined based on these tags.

Each tag specifies a list of other tags it can access. To maintain clarity, it’s best practice to categorize tags into
two groups: one for defining the module's domain/scope and another for defining the module's type.

For instance, if an application includes a customer domain and a holiday domain, these would define the domain tags.

A domain has different modules distinguished by type tags. For example, one module might contain smart components, another might have dumb components, and another might handle logic.

Domain tags could be `domain:customer` and `domain:holiday`. Type tags could be `type:feature` (for smart components),
`type:ui` (for dumb components), or `type:data` (for logic).

In this case, each module has both a domain tag and a type tag. For example, a module containing smart components for
customers would have `domain:customer` and `type:feature`. A module in the same domain but containing UI
components would have `domain:customer` and `type:ui`.

Dependency rules specify that a module tagged with `domain:customer` can only access modules with the same domain tag.
Additionally, a module tagged with `type:feature` can access modules tagged with `type:ui` and `type:data`.

When a module containing smart components needs to access a dumb component, Sheriff retrieves the tags for both modules.
It then checks each tag of the smart component module to determine if it is permitted to access the corresponding tags
of the dumb component module.

```mermaid
stateDiagram-v2
  [*] --> RequestAccessToModule
  RequestAccessToModule --> GetFromAndToTags
  GetFromAndToTags --> IterateOverFromTags
  IterateOverFromTags --> HasFromTagAccessToAnyToTag
  HasFromTagAccessToAnyToTag --> AccessDenied: No
  HasFromTagAccessToAnyToTag --> MoreFromTagsAvailable: Yes
  MoreFromTagsAvailable --> AccessGranted: No
  MoreFromTagsAvailable --> IterateOverFromTags: Yes
  AccessGranted --> [*]
  AccessDenied --> [*]

```

Since both modules share the same domain, access is allowed based on the domain tag. Additionally, because "type:
feature" is allowed to access "type:ui", all tags are cleared, and access is granted.

```mermaid
flowchart LR
  subgraph "smart components"
    direction TB
    dc1[domain:customer]
    sc1[type:feature]
  end

  subgraph "dumb components"
    direction TB
    dc2[domain:customer]
    sc2[type:ui]
  end

  sc1 --> sc2
  dc1 --> dc2
  linkStyle 0 stroke-width: 2px, fill: green, stroke: green;
  linkStyle 1 stroke-width: 2px, fill: green, stroke: green;
```

Conversely, if a dumb component tries to access a smart component, access would be denied based on the type tag.

```mermaid
flowchart LR
  subgraph "dumb components"
    direction TB
    dc1[domain:customer]
    sc1[type:ui]
  end

  subgraph "smart components"
    direction TB
    dc2[domain:customer]
    sc2[type:feature]
  end

  sc1 --> sc2
  dc1 --> dc2
  linkStyle 0 stroke-width: 2px, fill: green, stroke: red;
  linkStyle 1 stroke-width: 2px, fill: green, stroke: green;
```

If a smart component from the customer domain tries to access a dumb component from another domain, access would be
denied due to the domain tag.

```mermaid
flowchart LR
  subgraph "Customers"
    subgraph "smart components"
      direction TB
      dc1[domain:customer]
      sc1[type:feature]
    end
  end

  subgraph Holidays
    subgraph "dumb components"
      direction TB
      dc2[domain:holiday]
      sc2[type:ui]
    end
  end

  sc1 --> sc2
  dc1 --> dc2
  linkStyle 0 stroke-width: 2px, fill: green, stroke: green;
  linkStyle 1 stroke-width: 2px, fill: green, stroke: red;
```

## Automatic Tagging

Sheriff automatically detects modules and assigns the `noTag` tag to them.

It assigns all files that aren't part of a module to the `root` module. The root module gets the `root` tag.

It's essential to set up the dependency rules. Specifically, the [`root` tag](#the-root-tag) (i.e., the root module) needs to access all modules tagged with `noTag`.

The `depRules` property in the _sheriff.config.ts_ file defines the dependency rules. This property is an object literal where each key represents the tag of a module that wants to access another module. Its value specifies the tags it can access.

Initially, all modules can access each other, meaning that every `noTag` module can access other `noTag` modules.

The initial configuration from the [CLI](./cli) includes this setup.

Here’s an example configuration in `sheriff.config.ts`:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  depRules: {
    root: 'noTag',
    noTag: ['noTag', 'root'],
  },
};
```

That is also the recommendation for existing projects because it allows an incremental integration of Sheriff.

For green-field projects, the [manual tagging](#manual-tagging) is the better option.

---

To disable automatic tagging, set `autoTagging` to `false`:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  autoTagging: false,
  modules: {
    // see below...
  },
};
```

## The `root` Tag

Given the following project structure:

<pre>
src/app
├── main.ts
├── app.config.ts
├── app.component.ts
├── holidays
│   ├── data
│   │   ├── index.ts
│   │   ├── internal.service.ts
│   │   └── holidays-data.service.ts
│   ├── feature
│   │   ├── index.ts
│   │   └── holidays-facade.service.ts
│── core
│   ├── header.component.ts
│   ├── footer.component.ts
</pre>

The directories `src/app/holidays/data` and `src/app/holidays/feature` are barrel modules. All other files are part of the root module, which is automatically tagged with `root` by Sheriff

This tagging of the `root` module cannot be changed. With disabled barrel-less mode (`enableBarrelLess: false`), which is the default, no module can access the root module.

The property `excludeRoot` can disable this behavior. [By default](./integration). The best option, though, is to enable barrel-less mode which makes `root` a barrel-less module.

```mermaid
flowchart LR
  app.config.ts --> holidays/feature/index.ts
  holidays/feature/holidays.component.ts --> holidays/data/index.ts

  subgraph "noTag (holidays/data)"
    holidays/data/index.ts
    holidays/data/internal.service.ts
    holidays/data/holidays-data.service.ts
  end
  subgraph "noTag (holidays/feature)"
    holidays/feature/index.ts
    holidays/feature/holidays.component.ts
  end
  subgraph root
    main.ts
    app.config.ts
    app.component.ts
    core/header.component.ts
    core/footer.component.ts
  end

  style holidays/feature/index.ts stroke: #333, stroke-width: 4px
  style holidays/data/index.ts stroke: #333, stroke-width: 4px
  style root fill: #f9f9f9
```

## Manual Tagging

The `modules` property in the `sheriff.config.ts` defines barrel-less modules but also assigns tags to modules, regardless if barrel or barrel-less.

The keys of `modules` represent the module directories, and the corresponding values are the tags assigned to those modules.

The following snippet demonstrates a configuration where four directories are assigned both a domain and a module type:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app/holidays/feature': ['domain:holidays', 'type:feature'],
    'src/app/holidays/data': ['domain:holidays', 'type:data'],
    'src/app/customers/feature': ['domain:customers', 'type:feature'],
    'src/app/customers/data': ['domain:customers', 'type:data'],
  },
  depRules: {},
};
```

`domain:_` and `type:_` define two dimensions for the whole project. The following rules should apply:

1. A module can only depend on other modules of the same domain.
2. A module tagged as `type:feature` can depend on `type:data`, but the reverse is not allowed.
3. The `root` module can depend on modules tagged as `type:feature`. Since the root module only has the `root` tag,
   there is no need to include domain tags.

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app/holidays/feature': ['domain:holidays', 'type:feature'],
    'src/app/holidays/data': ['domain:holidays', 'type:data'],
    'src/app/customers/feature': ['domain:customers', 'type:feature'],
    'src/app/customers/data': ['domain:customers', 'type:data'],
  },
  depRules: {
    'domain:holidays': ['domain:holidays'], // Rule 1
    'domain:customers': ['domain:customers'], // Rule 1
    'type:feature': 'type:data', // Rule 2
    root: 'type:feature', // Rule 3
  },
};
```

If these rules are violated, a linting error will be triggered:

<img width="1512" alt="Violation of Dependency Rules" src="../img/dependency-rules-1.png"></img>

If only the modules within the director "holidays" should get tags, and the other modules should be auto-tagged, i.e. `noTag`, the configuration would look like this:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app/holidays/feature': ['domain:holidays', 'type:feature'],
    'src/app/holidays/data': ['domain:holidays', 'type:data'],
  },
  depRules: {
    'domain:holidays': ['domain:holidays', 'noTag'],
    'type:feature': ['type:data', 'noTag'],
    root: ['type:feature', 'noTag'],
    noTag: ['noTag', 'root'],
  },
};
```

Note: This setup allows any module from `domain:holidays` to depend on modules within the `customers` directory, but the reverse is not permitted.

## Nested Paths

Nested paths simplify the configuration. Multiple levels are allowed.

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app': {
      holidays: {
        feature: ['domain:holidays', 'type:feature'],
        data: ['domain:holidays', 'type:data'],
      },
      customers: {
        feature: ['domain:customers', 'type:feature'],
        data: ['domain:customers', 'type:data'],
      },
    },
  },
  depRules: {
    'domain:holidays': ['domain:holidays'],
    'domain:customers': ['domain:customers'],
    'type:feature': 'type:data',
    root: ['type:feature'],
  },
};
```

## Placeholders

Placeholders help with repeating patterns. They have the syntax `<name>`, where `name` is the placeholder name.

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app': {
      holidays: {
        '<type>': ['domain:holidays', 'type:<type>'],
      },
      customers: {
        '<type>': ['domain:customers', 'type:<type>'],
      },
    },
  },
  depRules: {
    'domain:holidays': ['domain:holidays'],
    'domain:customers': ['domain:customers'],
    'type:feature': 'type:data',
    root: ['type:feature'],
  },
};
```

Placeholders are available on all levels. The configuration could therefore further be improved.

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
  },
  depRules: {
    'domain:holidays': ['domain:holidays'],
    'domain:customers': ['domain:customers'],
    'type:feature': 'type:data',
    root: ['type:feature'],
  },
};
```

## `depRules` Functions & Wildcards

`depRules` allows functions instead of static values. The names of the tags can include wildcards:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
  },
  depRules: {
    'domain:*': ({ from, to }) => from === to,
    'type:feature': 'type:data',
    root: ['type:feature'],
  },
};
```

or use `sameTag`, which is a pre-defined function.

```typescript
import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  modules: {
    'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
  },
  depRules: {
    'domain:*': [sameTag, 'shared'],
    'type:feature': 'type:data',
    root: ['type:feature'],
  },
};
```
