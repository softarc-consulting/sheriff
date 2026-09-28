#!/bin/bash
set -euo pipefail

fixture_directory=$(cd "$(dirname "$0")" && pwd)
declare -a typescript_versions=('4.8' '4.9' '5.0' '5.1' '5.2' '5.3' '5.4' '5.5' '5.6' '5.7' '5.8' '5.9' '6.0')
declare -a eslint_versions=('8.57.1' '9' '10')
declare -a configs=('.eslintrc.json' 'eslint.config.js')

for eslint_version in "${eslint_versions[@]}"; do
  eslint_major=${eslint_version%%.*}
  # Fresh dependencies per ESLint major, outside the repository's node_modules.
  matrix_directory=$(mktemp -d "$fixture_directory/../typescript-eslint-${eslint_major}.XXXXXX")
  cp -R "$fixture_directory/src" "$fixture_directory/sheriff.config.ts" "$fixture_directory/tsconfig.json" "$matrix_directory/"
  cd "$matrix_directory"
  printf '{"private": true}\n' > package.json

  # Parser 8.60.1 supports these ESLint versions and TypeScript >=4.8.4 <6.1.
  npm install --save-dev --save-exact "eslint@$eslint_version" typescript-eslint@8.60.1 @typescript-eslint/parser@8.60.1 "typescript@${typescript_versions[0]}"
  yalc add @softarc/sheriff-core @softarc/eslint-plugin-sheriff

  for typescript_version in "${typescript_versions[@]}"; do
    npm install --save-dev --save-exact "typescript@$typescript_version"
    node - "$eslint_major" "$typescript_version" <<'JS'
const assert = require('node:assert/strict');
const eslintVersion = require('eslint/package.json').version;
const typescriptVersion = require('typescript/package.json').version;
assert.equal(eslintVersion.split('.')[0], process.argv[2]);
assert.equal(typescriptVersion.split('.').slice(0, 2).join('.'), process.argv[3]);
console.log(`Installed ESLint ${eslintVersion}, TypeScript ${typescriptVersion}`);
JS

    for config in "${configs[@]}"; do
      # ESLint 10 removed legacy configuration support.
      if [[ "$eslint_major" == '10' && "$config" == '.eslintrc.json' ]]; then
        continue
      fi

      use_flat_config=true
      if [[ "$config" == '.eslintrc.json' ]]; then
        use_flat_config=false
      fi
      rm -f .eslintrc.json eslint.config.js lint.json
      cp "$fixture_directory/configs/$config" .
      echo "Testing with TypeScript $typescript_version, ESLint $eslint_major ($config)"

      # These fixtures intentionally violate rules: exit 1 is expected, 0 or 2 is not.
      lint_status=0
      ESLINT_USE_FLAT_CONFIG="$use_flat_config" ./node_modules/.bin/eslint src --format json --output-file lint.json || lint_status=$?
      if [[ "$lint_status" -ne 1 ]]; then
        echo "Expected ESLint to report violations (exit 1), got exit $lint_status"
        exit 1
      fi
      node "$fixture_directory/assert-lint.mjs" lint.json
    done
  done
done
