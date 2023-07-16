cd test-projects
cd angular-i
yarn
cp ./tests/dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --format json --output-file dynamic-import-lint.json
node tests/verify-linter.js
