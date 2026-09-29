# Sheriff

![build status](https://github.com/sheriff-arch/sheriff/actions/workflows/build.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/%40sheriff-arch%2Fcore.svg)](https://www.npmjs.com/package/%40sheriff-arch%2Fcore)

Sheriff is a tool designed to enforce module boundaries and dependency rules in TypeScript projects, ensuring a clean and maintainable codebase.

It operates with zero dependencies, requiring only TypeScript as a peer dependency.

Sheriff can be integrated with ESLint for enhanced developer experience or used standalone through its CLI.

Key features include:
- Enforcing module boundaries by defining public APIs through `index.ts` files.
- Dependency rules to control access between different parts of your application.
- Support for automatic and manual tagging of modules to apply dependency rules effectively.
- A CLI for initializing configurations, verifying rules, listing modules, and exporting dependency graphs.

For a more detailed guide on installation, setup, and usage, head to the **[Documentation](https://sheriff.softarc.io/)**.

To install Sheriff with the ESLint plugin, run

```shell
npm i -D @sheriff-arch/core @sheriff-arch/eslint-plugin-sheriff
npx sheriff init
```

<p align="center">
<img src="https://raw.githubusercontent.com/sheriff-arch/sheriff/main/logo.png" width="320" style="text-align: center">
</p>
