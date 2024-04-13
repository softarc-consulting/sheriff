set -e
yarn

# Dynamic Import Check
echo 'checking for dynamic import error'
cp ./tests/dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --force --format json --output-file dynamic-import-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-dynamic-import-lint.json ./angular-i/dynamic-import-lint.json
git checkout -q sheriff.config.ts

## Deep Import Check
echo 'checking for deep import error'
cp ./tests/customers-container.deep-import.component.ts src/app/customers/feature/components/customers-container.component.ts
npx ng lint --force --format json --output-file deep-import-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-deep-import-lint.json ./angular-i/deep-import-lint.json
git checkout -q src/app/customers/feature/components/customers-container.component.ts

## Dependency Rule Check
echo 'checking for dependency rule error'
cp ./tests/customer.dependency-rule.component.ts src/app/customers/ui/customer/customer.component.ts
npx ng lint --force --format json --output-file dependency-rule-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-dependency-rule-lint.json ./angular-i/dependency-rule-lint.json
git checkout -q src/app/customers/ui/customer/customer.component.ts

## User Error Processing
echo 'checking for user error processing'
cp ./tests/empty-sheriff.config.ts ./sheriff.config.ts
npx ng lint --force --format json --output-file user-error-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-user-error-lint.json ./angular-i/user-error-lint.json "$(pwd)"
git checkout -q sheriff.config.ts

## Auto Tagging
echo 'checking for auto tagging'
cp ./tests/auto-tagging.config.ts ./sheriff.config.ts
npx ng lint --force --format json --output-file auto-tagging-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-auto-tagging-lint.json ./angular-i/auto-tagging-lint.json "$(pwd)"
git checkout -q sheriff.config.ts
