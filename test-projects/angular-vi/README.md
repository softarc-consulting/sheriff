# Angular 22.2 / ESLint 10 integration fixture

Copied from `angular-iv` (Angular 18), which remains unchanged. This is the
single-application fixture with the original Sheriff integration scenarios.
It installs dependencies with pnpm 12.4.2 and its own frozen lockfile, then adds
the locally packed Sheriff archives with pnpm. Only the temporary copy's manifest
and lockfile change; commands run with `pnpm exec`.

The copy was migrated with Angular CLI updates, one major at a time, including
Angular Material, NgRx, and angular-eslint update schematics:

```sh
pnpm exec ng update @angular/core@19 @angular/cli@19 @angular/material@19 angular-eslint@19 @ngrx/store@19 @ngrx/operators@19 @testing-library/angular@17
pnpm exec ng update @angular/core@20 @angular/cli@20 @angular/material@20 angular-eslint@20 @ngrx/store@20 @ngrx/operators@20 @testing-library/angular@18 typescript-eslint@8
pnpm exec ng update @angular/core@21 @angular/cli@21 @angular/material@21 angular-eslint@21 @ngrx/store@21 @ngrx/operators@21 @testing-library/angular@19
pnpm exec ng update @angular/core@22.2 @angular/cli@22.2 @angular/material@22.2 angular-eslint@22 @ngrx/store@22 @ngrx/operators@22
pnpm exec ng update @ngx-formly/core@8 @ngx-formly/material@8
pnpm add -D -E eslint@10 @eslint/js@10 typescript-eslint@8
```

The angular-eslint migrations retained ESLint 9, so ESLint 10 was installed
explicitly afterward. The deprecated TypeScript `baseUrl` was replaced by
relative path mappings. The production bundle's error budget was raised from
1 MB to 2 MB for the upgraded application (approximately 1.15 MB).
The lint configuration preserves the migration's eager change detection and
existing constructor injection rather than requiring unrelated refactoring.

The replacement components used to trigger Sheriff violations were adapted to
the migrated components. Every expected diagnostic's file, rule, severity, and
message was compared with the Angular 18 fixture before refreshing snapshots;
only source locations, embedded source, and lint output metadata changed.
The four CLI output snapshots remain unchanged.

`integration-test.sh` installs locked dependencies, adds locally built Sheriff
package archives with pnpm, verifies Angular 22.2 and ESLint 10, builds the app, and runs
all existing scenarios: CLI list/export/verify, dynamic imports, encapsulation,
dependency rules, configuration errors, auto-tagging, re-exports, and ignored
file extensions. Each scenario compares its actual output with `tests/expected`.

Run it through the repository's `run-integration-tests.sh` after
`pnpm pack:sheriff`, so the fixture executes in a temporary directory.
