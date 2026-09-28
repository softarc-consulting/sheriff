#!/bin/bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
PACKAGES_DIR="$ROOT_DIR/dist/integration-packages"
mkdir -p "$PACKAGES_DIR"

for package in core eslint-plugin; do
  if [ ! -f "$ROOT_DIR/dist/packages/$package/package.json" ]; then
    echo 'Build Sheriff first with pnpm build:all.' >&2
    exit 1
  fi
  pnpm --dir "$ROOT_DIR/dist/packages/$package" pack --out "$PACKAGES_DIR/$package.tgz"
done
