#!/bin/bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
CORE_ARCHIVE="$ROOT_DIR/dist/integration-packages/core.tgz"
if [ ! -f "$CORE_ARCHIVE" ]; then
  echo 'Prepare the built packages first with pnpm pack:sheriff.' >&2
  exit 1
fi

# Config evaluation uses CommonJS require, outside Vitest's source aliases.
# Give these tests a local installed core without modifying the root manifest.
RUNTIME_DIR=$(mktemp -d)
trap 'rm -rf "$RUNTIME_DIR"' EXIT
cd "$ROOT_DIR"
node --test test-projects/assert-local-packages.test.mjs
TYPESCRIPT_VERSION=$(node -p "require('typescript/package.json').version")
printf '{"private":true}\n' > "$RUNTIME_DIR/package.json"
pnpm --dir "$RUNTIME_DIR" add --ignore-scripts --save-exact "$CORE_ARCHIVE" "typescript@$TYPESCRIPT_VERSION"
NODE_PATH="$RUNTIME_DIR/node_modules${NODE_PATH:+:$NODE_PATH}" pnpm exec vitest -c vitest.config.ci.ts "$@"
