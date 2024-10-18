---
sidebar_position: 1
title: Introduction
displayed_sidebar: tutorialSidebar
---

**Sheriff** enforces module boundaries and dependency rules in TypeScript.

- **[Module boundaries](./module_boundaries.md)** ensure that files within a module are encapsulated, preventing access from outside the module. Modules are defined either via a `sheriff.config.ts` file or by the presence of a barrel file, like `index.ts`.

- **[Dependency rules](./dependency-rules.md)** allow you to specify which modules can depend on one another, enforcing a clear structure throughout your project. Like module boundaries, these rules are defined in the `sheriff.config.ts` file.

Sheriff has **zero external dependencies**, with TypeScript as its only peer dependency.
