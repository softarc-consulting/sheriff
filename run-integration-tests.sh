set -e

cd test-projects
cd angular-i
yarn

# Dynamic Import Check
echo 'checking for dynamic import error'
cp ./tests/dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --force --format json --output-file dynamic-import-lint.json
npx ts-node --esm tests/verify-linter.mts expected-dynamic-import-lint.json dynamic-import-lint.json
git checkout sheriff.config.ts

## Deep Import Check
echo 'checking for deep import error'
cp ./tests/customers-container.deep-import.component.ts src/app/customers/feature/components/customers-container.component.ts
npx ng lint --force --format json --output-file deep-import-lint.json
npx ts-node --esm tests/verify-linter.mts expected-deep-import-lint.json deep-import-lint.json
git checkout src/app/customers/feature/components/customers-container.component.ts

## Dependency Rule Check
echo 'checking for dependency rule error'
cp ./tests/customer.dependency-rule.component.ts src/app/customers/ui/customer/customer.component.ts
npx ng lint --force --format json --output-file dependency-rule-lint.json
npx ts-node --esm tests/verify-linter.mts expected-dependency-rule-lint.json dependency-rule-lint.json
git checkout src/app/customers/ui/customer/customer.component.ts

cd ../..

## TypeScript Versions
echo 'checking against different TypeScript versions'
cp -rv ../../node_modules/@softarc node_modules
npm install typescript@4.8

