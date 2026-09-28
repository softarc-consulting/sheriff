#!/bin/bash
set -e

# This uses different TypeScript versions and verifies that Sheriff works.
# We need to copy Sheriff from the parent node_modules. Otherwise, ESLint
# would also pick the TypeScript version from the parent.

echo 'checking against different TypeScript versions'

declare -a versions=('4.8' '4.9' '5.0' '5.1' '5.2' '5.3' '5.4' '5.5' '5.6' '5.7' '5.8' '5.9' '6.0')
declare -a eslint_versions=('8.57.1' '9' '10')
declare -a configs=('.eslintrc.json' 'eslint.config.js')

# The parent runner already copied this fixture into a temporary directory.
# Use only the dependencies shared by all tested ESLint versions.
printf '{"private": true}\n' > package.json
npm install --save-dev --save-exact eslint@8.57.1 typescript@4.8.4 typescript-eslint@8.60.1 @typescript-eslint/parser@8.60.1
yalc add @softarc/sheriff-core @softarc/eslint-plugin-sheriff
cd node_modules/.bin # yalc doesn't create symlink in node_modules/.bin
ln -s ../@softarc/sheriff-core/src/bin/main.js ./sheriff
cd ../../

for version in ${versions[*]}; do
  for config in ${configs[*]}; do

    eslint=""
    if [[ $config == ".eslintrc.json" ]]
    then
      eslint="legacy"
      export ESLINT_USE_FLAT_CONFIG=false
      cp configs/.eslintrc.json .
    else
      eslint="flat"
      export ESLINT_USE_FLAT_CONFIG=true
      cp configs/eslint.config.js .
      rm .eslintrc.json
    fi

    npm install typescript@$version
    installed_version=$(npx tsc -v)

    if [[ ! $installed_version == "Version $version"* ]]
    then
      echo "TypeScript should be $version but was $installed_version"
      exit 1;
    fi

    for eslint_version in ${eslint_versions[*]}; do
      # ESLint 10 only supports flat config.
      if [[ $eslint_version == "10" && $eslint == "legacy" ]]; then
        continue
      fi

      npm install eslint@$eslint_version
      installed_eslint=$(npx eslint -v)
      if [[ $installed_eslint != v${eslint_version%%.*}.* ]]; then
        echo "ESLint should be $eslint_version but was $installed_eslint"
        exit 1;
      fi

      echo "Testing with TypeScript $version, ESLint $installed_eslint ($eslint)"
      # Rule violations intentionally produce exit 1; configuration errors must fail.
      npx eslint src --format json --output-file lint.json || test "$?" -eq 1
      node ./assert-lint.mjs lint.json
      node ../remove-paths.mjs lint.json
    done
  done
done
