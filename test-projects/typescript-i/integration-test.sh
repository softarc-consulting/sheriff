#!/bin/bash

# This uses different TypeScript versions and verifies that Sheriff works.
# We need to copy Sheriff from the parent node_modules. Otherwise, ESLint
# would also pick the TypeScript version from the parent.

echo 'checking against different TypeScript versions'

declare -a versions=('4.8' '4.9' '5.0' '5.1' '5.2' '5.3' '5.4' '5.5')
declare -a configs=('.eslintrc.json' 'eslint.config.js')

npm i
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
      cp configs/.eslintrc.json .
    else
      eslint="flat"
      cp configs/eslint.config.js .
      rm .eslintrc.json
    fi

    echo "Testing with TypeScript $version, ESLint $eslint"
    npm install typescript@$version
    installed_version=$(npx tsc -v)

    if [[ ! $installed_version == "Version $version"* ]]
    then
      echo "TypeScript should be $version but was $installed_version"
      exit 1;
    fi

    npx eslint src --format json --output-file lint.json
    node ../remove-paths.mjs lint.json
  done
done
