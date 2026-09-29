---
sidebar_position: 2
title: Installation & Setup
displayed_sidebar: tutorialSidebar
---

Examples are available at https://github.com/sheriff-arch/sheriff/tree/main/test-projects


## Migrating from the `@softarc` packages

Sheriff is moving to the `sheriff-arch` organization. Replace both packages together
once the new packages are published:

```shell
npm uninstall @softarc/sheriff-core @softarc/eslint-plugin-sheriff
npm install --save-dev @sheriff-arch/core @sheriff-arch/eslint-plugin-sheriff
```

Update imports in `sheriff.config.ts`, application tooling, and ESLint configuration:

| Previous name | New name |
| --- | --- |
| `@softarc/sheriff-core` | `@sheriff-arch/core` |
| `@softarc/eslint-plugin-sheriff` | `@sheriff-arch/eslint-plugin-sheriff` |
| `plugin:@softarc/sheriff/legacy` | `plugin:@sheriff-arch/sheriff/legacy` |
| `@softarc/sheriff/encapsulation` | `@sheriff-arch/sheriff/encapsulation` |
| `@softarc/sheriff/dependency-rule` | `@sheriff-arch/sheriff/dependency-rule` |

The same namespace change applies to `legacyBarrelModulesOnly` and the deprecated
`deep-import` rule. Flat configurations that use `sheriff.configs.all` only need
the package import updated; explicitly configured Sheriff rule IDs must use the
new namespace shown above. The CLI command remains `sheriff`.

Historical release notes retain the package names that applied to those releases.

## Sheriff and ESLint (recommended)

In order to get the best developer experience, we recommend to use Sheriff with the ESLint plugin.

```shell
npm install -D @sheriff-arch/core @sheriff-arch/eslint-plugin-sheriff
```

### Flat Config (_eslint.config.js_)

```javascript
// ...
const sheriff = require('@sheriff-arch/eslint-plugin-sheriff');

module.exports = tseslint.config(
  // ...
  {
    files: ['**/*.ts'],
    extends: [sheriff.configs.all],
  },
);
````

### Legacy Config (_.eslintrc.json_)

```json
{
  "files": ["*.ts"],
  "extends": ["plugin:@sheriff-arch/sheriff/legacy"]
}
```


:::note

Please note, that the legacy mode's name was changed from `default` to `legacy` in [version 0.16](./release-notes/0.16).

:::

<details>

<summary>Angular (CLI, Flat & @angular-eslint) Example</summary>

```javascript
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const sheriff = require('@sheriff-arch/eslint-plugin-sheriff');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'eternal',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'eternal',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  {
    files: ['**/*.ts'],
    extends: [sheriff.configs.all],
  },
);

```

</details>

<details>

<summary>Angular (CLI, Legacy & @angular-eslint) Example</summary>

```json5
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "eternal",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "eternal",
            "style": "kebab-case"
          }
        ]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {}
    },
    {
      "files": ["*.ts"],
      "extends": ["plugin:@sheriff-arch/sheriff/legacy"]
    }
  ]
}

```

</details>

<details>
  <summary>Angular (Nx, Flat) Example</summary>

  **eslint.config.mjs**

```js
import nx from '@nx/eslint-plugin';
import sheriff from '@sheriff-arch/eslint-plugin-sheriff' // <-- add this

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  sheriff.configs.all, // <-- add this
  // ... further settings
];
```
</details>


<details>

<summary>Angular (Nx, Legacy) Example</summary>

```jsonc
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "plugins": ["@nrwl/nx"],
  "overrides": [
    // existing rules...
    {
      "files": ["*.ts"],
      "extends": ["plugin:@sheriff-arch/sheriff/legacy"],
    },
  ],
}
```

</details>

## Sheriff without ESLint

You can also use Sheriff without ESLint. In this case, you have to run the Sheriff CLI manually.

```shell
npm install -D @sheriff-arch/core
```

The CLI provides you with commands to list modules, check the rules and export the dependency graph in JSON format.

For more details, see the [CLI](./cli).
