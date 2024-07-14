# Sheriff

![build status](https://github.com/softarc-consulting/sheriff/actions/workflows/build.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/%40softarc%2Fsheriff-core.svg)](https://www.npmjs.com/package/%40softarc%2Fsheriff-core)

Sheriff is a tool designed to enforce module boundaries and dependency rules in TypeScript projects, ensuring a clean and maintainable codebase.

It operates with zero dependencies, requiring only TypeScript as a peer dependency.

Sheriff can be integrated with ESLint for enhanced developer experience or used standalone through its CLI.

Key features include:
- Enforcing module boundaries by defining public APIs through `index.ts` files.
- Dependency rules to control access between different parts of your application.
- Support for automatic and manual tagging of modules to apply dependency rules effectively.
- A CLI for initializing configurations, verifying rules, listing modules, and exporting dependency graphs.

For a more detailed guide on installation, setup, and usage, head to the **[Documentation](https://softarc-consulting.github.io/sheriff/)**.

To install Sheriff with the ESLint plugin, run

```shell
npm i -D @softarc/sheriff-core @softarc/eslint-plugin-sheriff
npx sheriff init
```


