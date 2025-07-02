---
sidebar_position: 5
title: CLI
displayed_sidebar: tutorialSidebar
---

The core package (@softarc/sheriff-core) comes with a CLI to initialize the configuration file, list modules, check the rules and export the dependency graph in JSON format.

## `init`

Run `npx sheriff init` to create a `sheriff.config.ts`. Its configuration runs with [automatic tagging](./dependency-rules#automatic-tagging), meaning no dependency rules are in place, and it only checks for the module boundaries.

## `verify`
Run `npx sheriff verify` either against an `entryFile` or against one or multiple `entryPoints` to check if your project violates any of your rules. 

To run sheriff against an `entryFile` run `npx sheriff verify main.ts`. `main.ts` is the entry file where Sheriff should traverse the imports.

Depending on your project, you will likely have a different entry file. For example, with an Angular CLI-based project, it would be `npx sheriff verify src/main.ts`.

You can omit the entry file if you set a value to the property `entryFile` in the `sheriff.config.ts`.

In that case, you only run `npx sheriff verify`.

To run sheriff against `entryPoints` run `npx sheriff verify app-i,app-ii`. `app-i` and `app-ii` are the entry points where Sheriff should traverse the imports.

The `entryPoints` must be defined in the `sheriff.config.ts` file.

## `list`

Run `npx sheriff list main.ts` to print out all your modules along their tags. As explained above, you can alternatively use the `entryFile` property in `sheriff.config.ts`.

Alternatively, you can run `npx sheriff list app-i,app-ii` to list the modules for the specified `entryPoints`.

## `export`

Run `npx sheriff export main.ts > export.json` and the dependency graph will be stored in `export.json` in JSON format. The dependency graph starts from the entry file and includes all reachable files. For every file, it will include the assigned module as well as the tags.

Alternatively, you can run `npx sheriff export app-i,app-ii > export.json`.
