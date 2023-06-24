![build status](https://github.com/softarc-consulting/sheriff/actions/workflows/build.yml/badge.svg)

<p align="center">
<img src="https://raw.githubusercontent.com/softarc-consulting/sheriff/main/logo.png" width="320" style="text-align: center">
</p>

# Sheriff

Sheriff enforces module boundaries and dependency rules in TypeScript.

It is easy to use and has **zero dependencies**. The only peer dependency is TypeScript itself.

Examples are located in _./test-projects/_.

- [Sheriff](#sheriff)
  - [Installation \& Setup](#installation--setup)
  - [Module Boundaries](#module-boundaries)
  - [Dependency Rules](#dependency-rules)
    - [Nested Paths](#nested-paths)
    - [Placeholders](#placeholders)
    - [DepRules Functions \& Wildcards](#deprules-functions--wildcards)
  - [Advantages](#advantages)
  - [Upcoming Features](#upcoming-features)

## Installation & Setup

```shell
npm install -D @softarc/sheriff-core @softarc/eslint-plugin-sheriff
```

In your _eslintrc.json_, insert the rules:

```json
{
  "files": ["*.ts"],
  "extends": ["plugin:@softarc/sheriff/default"]
}
```

<details>

<summary>Show Example for Angular (CLI)</summary>

```jsonc
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "overrides": [
    // existing rules...
    {
      "files": ["*.ts"]
      "extends": ["plugin:@softarc/sheriff/default"]
    }
  ]
}
```

</details>

<details>

<summary>Show Example for Angular (NX)</summary>

```jsonc
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "plugins": ["@nrwl/nx"],
  "overrides": [
    // existing rules...
    {
      "files": ["*.ts"]
      "extends": ["plugin:@softarc/sheriff/default"]
    }
  ]
}
```

</details>

## Module Boundaries

Every directory with an _index.ts_ is a module. The _index.ts_ exports
those files that should be accessible from the outside.

In the screenshot below, you see an _index.ts_, which exposes the _holidays-facade.service.ts_, but encapsulates the _internal.service.ts_.

<img width="1905" alt="Screenshot 2023-06-24 at 12 24 09" src="https://github.com/softarc-consulting/sheriff/assets/5721205/a581e3a2-9609-4fcf-b2ac-f5f761167200">

Every file outside of that directory (module) now gets a linting error when it imports the _internal.service.ts_.

<img width="1905" alt="Screenshot 2023-06-24 at 12 23 32" src="https://github.com/softarc-consulting/sheriff/assets/5721205/23db7bd9-1ce1-4cdc-9fc6-86dbdb71d0fe">

## Dependency Rules

Sheriff allows the configuration of access rules between modules.

For that, there has to be a _sheriff.config.ts_ in the project's root folder. The config assigns tags to every directory that represents a module, i.e. it contains an _index.ts_.

The dependency rules operate on these tags.

The following snippet shows a configuration where four directories are assigned to a domain and to a module type:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app/holidays/feature': ['domain:holidays', 'type:feature'],
    'src/app/holidays/data': ['domain:holidays', 'type:data'],
    'src/app/customers/feature': ['domain:customers', 'type:feature'],
    'src/app/customers/data': ['domain:customers', 'type:data'],
  },
  depRules: {},
};
```

If modules of the same domains can access each other and if a module of type feature can access type data but not the other way around, the `depRules` in the config would have these values.

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app/holidays/feature': ['domain:holidays', 'type:feature'],
    'src/app/holidays/data': ['domain:holidays', 'type:data'],
    'src/app/customers/feature': ['domain:customers', 'type:feature'],
    'src/app/customers/data': ['domain:customers', 'type:data'],
  },
  depRules: {
    'domain:holidays': ['domain:holidays', 'shared'],
    'domain:customers': ['domain:customers', 'shared'],
    'type:feature': 'type:data',
  },
};
```

If those roles are broken, a linting error is raised:

<img width="1512" alt="Screenshot 2023-06-13 at 17 50 41" src="https://github.com/softarc-consulting/sheriff/assets/5721205/37fe3f6c-1bf9-413c-999d-4da700f33257">

### Nested Paths

The configuration can be simplified by nesting the paths. Multiple levels are allowed.

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
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
    'domain:holidays': ['domain:holidays', 'shared'],
    'domain:customers': ['domain:customers', 'shared'],
    'type:feature': 'type:data',
  },
};
```

### Placeholders

For repeating patterns, one can also use placeholders with the syntax `<name>`:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
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
    'domain:holidays': ['domain:holidays', 'shared'],
    'domain:customers': ['domain:customers', 'shared'],
    'type:feature': 'type:data',
  },
};
```

Since placeholders are allowed on all levels, we could have the following improved version:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
  },
  depRules: {
    'domain:holidays': ['domain:holidays', 'shared'],
    'domain:customers': ['domain:customers', 'shared'],
    'type:feature': 'type:data',
  },
};
```

### DepRules Functions & Wildcards

The values of the dependency rules can also be implemented as functions. The names of the tags can include wildcards.

So an optimised version would look like this:

```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
  },
  depRules: {
    'domain:*': [({ from, to }) => from === to, 'shared'],
    'type:feature': 'type:data',
  },
};
```

or

```typescript
import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
  },
  depRules: {
    'domain:*': [sameTag, 'shared'],
    'type:feature': 'type:data',
  },
};
```

## Advantages

- lightweight
- powerful customisation
- zero dependencies

## Upcoming Features

For feature requests, please add an issue at https://github.com/softarc-consulting/sheriff.

- Print modules with their tags
- Testing Dependency Rules
- Angular Schematic
- Feature Shell: It shouldn't be necessary to create a feature subdirectory for a domain, since feature has access to everything
- Dependency rules for node_modules
- CLI as alternative to eslint
- Highly configurable:
  - no deep import
  - hierarchy check
  - tags via config (static string, placeholder, regular expression, function )
- Find cyclic dependencies
- Find unused files
- Visualization
- TestCoverage 100%
- UI for Konfiguration
- Migration from Nx (automatic)
- Cache
