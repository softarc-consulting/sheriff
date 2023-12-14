set -e
yarn

# Dynamic Import Check
echo 'checking for dynamic import error'
cp ./tests/dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --force --format json --output-file dynamic-import-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-dynamic-import-lint.json ./angular-i/dynamic-import-lint.json
git checkout sheriff.config.ts

## Deep Import Check
echo 'checking for deep import error'
cp ./tests/customers-container.deep-import.component.ts src/app/customers/feature/components/customers-container.component.ts
npx ng lint --force --format json --output-file deep-import-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-deep-import-lint.json ./angular-i/deep-import-lint.json
git checkout src/app/customers/feature/components/customers-container.component.ts

## Dependency Rule Check
echo 'checking for dependency rule error'
cp ./tests/customer.dependency-rule.component.ts src/app/customers/ui/customer/customer.component.ts
npx ng lint --force --format json --output-file dependency-rule-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-dependency-rule-lint.json ./angular-i/dependency-rule-lint.json
git checkout src/app/customers/ui/customer/customer.component.ts

## Internal Error Processing
echo 'checking for internal error processing'
cp ./tests/empty-sheriff.config.ts ./sheriff.config.ts
npx ng lint --force --format json --output-file internal-error-processing-lint.json
node ../verify-linter.mjs ./angular-i/tests/expected-internal-error-processing-lint.json ./angular-i/internal-error-processing-lint.json "$(pwd)"
git checkout sheriff.config.ts
