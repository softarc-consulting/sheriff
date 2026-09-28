# About Sheriff
Sheriff consists of three processes:

1. File Graph: `traverseFilesystem` gets and entry file and returns a graph of all the files that are required to run
   the entry file. The final type of the graph is `UnassignedFileInfo`, meaning graph without modules.
2. Modules: Based on `FileInfo`, `createModules` detects the existing modules and their dependencies. The final type of
   the modules is `ModuleInfo`.
3. Merging FileGraph and Modules: `FileInfo` is the final type of the graph that contains all the information about the
   files and modules. It is done by

The entry point is always the `init` function.

# Development

## Setup
Use Node.js 24 and pnpm 12.4.2 (pinned in `package.json`). To install all dependencies, run the following command:

```shell
pnpm install
```

## Run local integration tests

Build Sheriff and package both libraries, then run the consumer tests:

```shell
pnpm pack:sheriff
bash run-integration-tests.sh
```

`pack:sheriff` runs `build:all` and uses `pnpm pack` on the built package directories.
It writes `core.tgz` and `eslint-plugin.tgz` to the ignored `dist/integration-packages`
directory. Run it again after changing Sheriff so the tests use the new build.

The runner copies the fixtures into a temporary directory, exposed through
`.test-projects` for inspection. It installs their normal dependencies, using the
committed pnpm lockfile where available, then installs both local archives with
`pnpm add`. This deliberately updates only the temporary manifests and lockfiles.
No yalc installation, global yalc store, or manual executable links are needed.

Each consumer uses its own TypeScript and ESLint. The installation check verifies
the archive references, local package paths, the plugin's core dependency, and the
TypeScript/ESLint peer resolution. The TypeScript matrix repeats this check after
every version change, alongside its exact expected Sheriff diagnostics.

The full run covers the Angular 15, Angular 18, and Angular 22.2 integration
scenarios, the additional Angular 15 CI lint fixtures, and all 65 TypeScript/ESLint
configuration combinations. To run selected fixtures in isolation:

```shell
bash run-integration-tests.sh angular-vi
bash run-integration-tests.sh angular-i typescript-i
```

Use the runner rather than calling fixture scripts directly; it provides the
archive paths and keeps the tracked fixtures unchanged. Temporary directories are
retained after a run for debugging; `.test-projects` points to the latest run.
Starting a new run removes the previous temporary copy.

## Validation

```shell
pnpm lint:all
pnpm test --run
pnpm pack:sheriff
pnpm test:ci --run
bash run-integration-tests.sh
```

`pack:sheriff` includes `pnpm build:all`. `test:ci` runs the archive-resolution unit
tests and the existing coverage suite. Its compiled-package tests receive a
temporary installation of the packed core through `NODE_PATH`, because config
evaluation uses CommonJS `require` outside Vitest's source aliases. That temporary
installation is removed when the tests finish; the root manifest is unchanged.

To run just the archive-resolution unit tests, use `pnpm test:integration-tools`.
This workflow implements [issue #268](https://github.com/softarc-consulting/sheriff/issues/268).
