#!/bin/bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT_DIR"
export SHERIFF_PACKAGES_DIR="$ROOT_DIR/dist/integration-packages"
export SHERIFF_PACKAGE_MANAGER
SHERIFF_PACKAGE_MANAGER=$(node -p "require('./package.json').packageManager")
for package in core eslint-plugin; do
  if [ ! -f "$SHERIFF_PACKAGES_DIR/$package.tgz" ]; then
    echo 'Prepare the built packages first with pnpm pack:sheriff.' >&2
    exit 1
  fi
done

if [ "$#" -eq 0 ]; then
  set -- angular-i angular-ii angular-iii angular-iv angular-vi typescript-i
fi
for fixture in "$@"; do
  case "$fixture" in
    angular-i|angular-ii|angular-iii|angular-iv|angular-vi|typescript-i) ;;
    *) echo "Unknown integration fixture: $fixture" >&2; exit 1 ;;
  esac
done

# Keep tracked manifests and lockfiles unchanged. Replace the previous temporary run.
if [ -L .test-projects ]; then
  PREVIOUS_TMP_DIR=$(readlink .test-projects)
  rm .test-projects
  rm -rf "$PREVIOUS_TMP_DIR"
fi

export TMP_DIR
TMP_DIR=$(mktemp -d)
rsync -a --exclude node_modules --exclude .angular --exclude dist --exclude .yalc --exclude yalc.lock test-projects/ "$TMP_DIR"
ln -sfn "$TMP_DIR" .test-projects
echo "Temporary directory created at $TMP_DIR"

for fixture in "$@"; do
  echo "Testing $fixture"
  (
    cd "$TMP_DIR/$fixture"
    node -e "const fs = require('node:fs'); const p = JSON.parse(fs.readFileSync('package.json', 'utf8')); p.packageManager = process.env.SHERIFF_PACKAGE_MANAGER; fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\\n');"
    case "$fixture" in
      angular-ii|angular-iii)
        pnpm install --ignore-scripts
        bash ../install-sheriff.sh
        pnpm exec ng lint
        ;;
      *) bash ./integration-test.sh ;;
    esac
  )
done

echo 'Tests finished successfully'
