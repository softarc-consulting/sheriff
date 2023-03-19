![build status](https://github.com/rainerhahnekamp/sheriff/actions/workflows/build.yml/badge.svg)

# Sheriff

Sheriff enforces module boundaries and dependency rules in TypeScript.

It comes with **zero dependencies**. The only peer dependency is TypeScript itself.

Sheriff is available in two flavours: As eslint plugin or cli.

**Module Boundaries**

Every directory with an _index.ts_ counts as a module. The _index.ts_ exports
those files that should be accessible from the outside. Therefore, every `import`
into that module must point to the _index.ts_.

## Installation

### Eslint

```shell
npm install @softarc/eslint-plugin-sheriff
```

In your _eslintrc.json_, insert the rules:

```json
    {
      "files": ["*.ts"]
      "extends": ["plugin:@softarc/sheriff/default"]
    }
```

_Example: eslintrc.json_

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

# Feature Roadmap

- Testing Dependency Rules (ArchUnit)
- Encapsulation by convention
- Highly configurable:
  - no deep import
  - hierarchy check
  - tags via config (static string, placeholder, regular expression, function )
- Dependency Rules with individualistic
- Find cyclic dependencies
- Find unused files
- Visualization
- TestCoverage 100%
- Zero-Dependencies
- ESLint Plugin
- UI for Konfiguration
- Migration from Nx (automatic)
- Rules: AND OR
- Cache
- Easy Debuggability: Anonymized export

# Advantages

- Less boilerplate
- Testability much better because I just have one
- Interchangable
