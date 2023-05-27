![build status](https://github.com/softarc-consulting/sheriff/actions/workflows/build.yml/badge.svg)

<p align="center">
<img src="https://raw.githubusercontent.com/softarc-consulting/sheriff/main/logo.png" width="320" style="text-align: center">
</p>

# Sheriff

Sheriff enforces module boundaries and dependency rules in TypeScript.

It is easy to use and has **zero dependencies**. The only peer dependency is TypeScript itself.

**Module Boundaries**

Every directory with an _index.ts_ is a module. The _index.ts_ exports
those files that should be accessible from the outside. Therefore, every `import`
into that module must point to the _index.ts_.

**Dependency Rules**

```typescript
throw new DocsMissingException(); // ;)
```

## Installation

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

<summary>Show Example for Angular</summary>

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

## Advantages

- lightweight
- powerful customisation
- zero dependencies

## Upcoming Features

For feature requests, please add an issue at https://github.com/softarc/sheriff.

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
