#!/bin/bash

## TypeScript Versions
echo 'checking against different TypeScript versions'
cp -r ../../node_modules/@softarc node_modules

declare -a versions=('4.8' '4.9' '5.0' '5.1')

for version in ${versions[*]}; do
  npm install typescript@$version
  installed_version=$(npx tsc -v)

  if [[ ! $installed_version == "Version $version"* ]]
  then
    echo "TypeScript should be $version but was $installed_version"
    exit 1;
  fi

  npx eslint src --format json --output-file lint.json
  npx ts-node --esm ../verify-linter.mts ./typescript-i/tests/expected-lint.json ./typescript-i/lint.json
done
