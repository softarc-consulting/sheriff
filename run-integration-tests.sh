cd test-projects
cd angular-i
yarn
cp ./tests/dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --format json --output-file dynamic-import-lint.json
npx ts-node --esm tests/verify-linter.js
