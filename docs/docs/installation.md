---
sidebar_position: 2
title: Installation & Setup
---

Examples are available at https://github.com/softarc-consulting/sheriff/tree/main/test-projects

## Sheriff and ESLint (recommended)

In order to get the best developer experience, we recommend to use Sheriff with the ESLint plugin.

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

<summary>Angular (CLI) Example</summary>

```jsonc
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "overrides": [
    // existing rules...
    {
      "files": ["*.ts"],
      "extends": ["plugin:@softarc/sheriff/default"],
    },
  ],
}
```

</details>

<details>

<summary>Angular (NX) Example</summary>

```jsonc
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "plugins": ["@nrwl/nx"],
  "overrides": [
    // existing rules...
    {
      "files": ["*.ts"],
      "extends": ["plugin:@softarc/sheriff/default"],
    },
  ],
}
```

</details>

## Sheriff without ESLint

You can also use Sheriff without ESLint. In this case, you have to run the Sheriff CLI manually.

```shell
npm install -D @softarc/sheriff-core
```

The CLI provides you with commands to list modules, check the rules and export the dependency graph in JSON format.

For more details, see the [CLI](#cli).
