# Angular multi-project fixture

Use the locally built Sheriff packages, as in the other Angular fixtures. From
the repository root, run `pnpm link:sheriff` to build and publish to the local yalc
store. Then, from this directory, run:

```sh
pnpm install --ignore-workspace --ignore-scripts
yalc add --no-pure @sheriff-arch/core @sheriff-arch/eslint-plugin-sheriff
```

This avoids requiring the new package names to be available on npm before testing.
The yalc-added dependencies and lockfile changes are local test artifacts.
