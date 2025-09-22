#!/usr/bin/env bash
set -euo pipefail

# Mini release script driven by Bash with partial Node for JSON edits
#
# Usage:
#   bash tools/scripts/mini-release.sh <patch|minor|major> [remote]
#
# Arguments:
#   release type:   one of patch | minor | major
#   remote (opt.):  git remote name to push to (default: origin)

release_type="${1:-}"
remote="${2:-origin}"
if [[ "$release_type" != "patch" && "$release_type" != "minor" && "$release_type" != "major" ]]; then
  echo "Usage: bash tools/scripts/mini-release.sh <patch|minor|major> [remote]" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"

core_json="$repo_root/packages/core/package.json"
eslint_json="$repo_root/packages/eslint-plugin/package.json"

if [[ ! -f "$core_json" || ! -f "$eslint_json" ]]; then
  echo "Could not locate package.json files. Expected paths: $core_json, $eslint_json" >&2
  exit 1
fi

echo "[1/4] Bumping versions ($release_type) in core and eslint-plugin..."

next_version=$(node - "$release_type" "$core_json" "$eslint_json" <<'NODE'
const fs = require('fs');

const releaseType = process.argv[2];
const corePath = process.argv[3];
const eslintPath = process.argv[4];

function bumpVersion(version, type) {
  const m = /^(\d+)\.(\d+)\.(\d+)(.*)?$/.exec(version);
  if (!m) throw new Error(`Invalid version: ${version}`);
  const major = Number(m[1]);
  const minor = Number(m[2]);
  const patch = Number(m[3]);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: throw new Error(`Unknown release type: ${type}`);
  }
}

const corePkg = JSON.parse(fs.readFileSync(corePath, 'utf8'));
const eslintPkg = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));

const current = corePkg.version;
if (!current) throw new Error('packages/core/package.json missing version');
const next = bumpVersion(current, releaseType);

corePkg.version = next;
eslintPkg.version = next;
eslintPkg.peerDependencies = eslintPkg.peerDependencies || {};
eslintPkg.peerDependencies['@softarc/sheriff-core'] = next;

fs.writeFileSync(corePath, JSON.stringify(corePkg, null, 2));
fs.writeFileSync(eslintPath, JSON.stringify(eslintPkg, null, 2));

process.stdout.write(next);
NODE
)

echo "   -> Next version: $next_version"

echo "[2/4] Building all packages..."
(cd "$repo_root" && yarn build:all)

echo "[3/4] Pause before publish"
read -r -p "Press Enter to npm publish and commit (Ctrl+C to abort)... " _

echo "[4/4] Publishing to npm..."
(cd "$repo_root/dist/packages/core" && npm publish)
(cd "$repo_root/dist/packages/eslint-plugin" && npm publish)

echo "Creating git commit..."
(cd "$repo_root" && git add "$core_json" "$eslint_json" && \
  git commit -m "chore: release" -m "chore: release [$next_version]")

echo "Pushing to git remote '$remote'..."
(cd "$repo_root" && git push "$remote")

echo "Done."



