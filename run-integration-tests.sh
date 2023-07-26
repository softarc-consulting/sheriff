cd test-projects
cd angular-i
yarn

# Dynamic Import Check
echo 'checking for dynamic import error'
cp ./tests/dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --format json --output-file dynamic-import-lint.json
npx ts-node --esm tests/verify-linter.mts expected-dynamic-import-lint.json dynamic-import-lint.json
git checkout sheriff.config.ts

## Deep Import Check
echo 'checking for deep import error'
cp ./tests/customers-container.deep-import.component.ts src/app/customers/feature/components/customers-container.component.ts
npx ng lint --format json --output-file deep-import-lint.json
npx ts-node --esm tests/verify-linter.mts expected-deep-import-lint.json deep-import-lint.json
git checkout src/app/customers/feature/components/customers-container.component.ts


## Dependency Rule Check
#echo 'checking for dependency rule error'
