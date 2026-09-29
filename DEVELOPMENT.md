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

We can use Sheriff locally against the projects in the `test-projects`-folder in order to verify that the tool works as
expected. The following steps are required to run the tests:

1. **Build Sheriff**: `pnpm build:all`
2. **Link Sheriff**: `pnpm link:sheriff`
3. **Run the integration tests**: Execute one of the `integration-test.sh`-scripts within the tests projects or run all by executing the `run-integration-tests.sh`.

## Prepare a release with Nx

Start from a clean, up-to-date `main` checkout with `origin` pointing to
`softarc-consulting/sheriff`. Install with `pnpm install --frozen-lockfile` and run
the lint, unit, build, and integration checks above before preparing a release.
Keep unrelated untracked files out of the release commit; do not use `git add .`.

Preview the next release (replace `0.20.0` with the intended version):

```shell
pnpm exec nx release 0.20.0 --skip-publish --dry-run
```

Review the proposed versions and changelog, then create the local release:

```shell
pnpm exec nx release 0.20.0 --skip-publish
```

Nx versions `core` and `eslint-plugin` together, updates the plugin's exact core
peer requirement, updates the lockfile, writes the root `CHANGELOG.md`, creates
the release commit, and tags it as `v0.20.0`. Maintenance commits are included in
the changelog so compatibility updates such as ESLint 10 support are visible.
The plugin's local core development dependency uses `workspace:*` so the lockfile
update does not require the new core version to be published first.

This command does not publish to npm, push Git changes, or create a GitHub Release
page. After inspecting the commit and tag, push them together:

```shell
git push --atomic origin main refs/tags/v0.20.0
```

Npm publication is a separate maintainer step. Rebuild after versioning before
publishing the compiled packages in `dist/packages/core` and
`dist/packages/eslint-plugin`; the earlier build still contains the old versions.
Do not rerun the versioning command merely to publish an already prepared release.

See the [Nx release guide](https://nx.dev/docs/guides/nx-release/publish-in-ci-cd).
