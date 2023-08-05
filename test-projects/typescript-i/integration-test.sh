## TypeScript Versions
echo 'checking against different TypeScript versions'
cp -r ../../node_modules/@softarc node_modules
#npm install typescript@4.8
npx eslint src --force --format json --output-file linter.json
npx ts-node --esm ../verify-linter.mts expected-linter.json linter.json
