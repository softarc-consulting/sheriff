#!/bin/bash
set -euo pipefail

: "${SHERIFF_PACKAGES_DIR:?Run this fixture through run-integration-tests.sh}"
for package in core eslint-plugin; do
  test -f "$SHERIFF_PACKAGES_DIR/$package.tgz"
done

# Keep the utils peer aligned with the parser already selected by the fixture.
UTILS_VERSION=$(node -e "try { console.log(require('typescript-eslint/package.json').version); } catch { console.log(require('@typescript-eslint/parser/package.json').version); }")
pnpm add --ignore-scripts --save-dev --save-exact \
  "$SHERIFF_PACKAGES_DIR/core.tgz" \
  "$SHERIFF_PACKAGES_DIR/eslint-plugin.tgz" \
  "@typescript-eslint/utils@$UTILS_VERSION"
node ../assert-local-packages.mjs
