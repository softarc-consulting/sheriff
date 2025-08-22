set -e
yarn
yalc add @softarc/sheriff-core @softarc/eslint-plugin-sheriff
cd node_modules/.bin # yalc doesn't create symlink in node_modules/.bin
ln -sf ../@softarc/sheriff-core/src/bin/main.js ./sheriff
cd ../../
cp sheriff.config.ts sheriff.config.ts.original

# CLI List Check
echo 'checking for CLI list'
npx sheriff list src/main.ts > tests/actual/cli-list.txt
diff tests/actual/cli-list.txt tests/expected/cli-list.txt

# CLI Export Check
echo 'checking for CLI export'
npx sheriff export src/main.ts > tests/actual/cli-export.txt
diff tests/actual/cli-export.txt tests/expected/cli-export.txt

# CLI Verify Check (failure)
echo 'checking for CLI verify (failure scenario)'
cp tests/sheriff.config-failure.ts sheriff.config.ts
npx sheriff verify src/main.ts > tests/actual/cli-verify-failure.txt || true
diff tests/actual/cli-verify-failure.txt tests/expected/cli-verify-failure.txt
cp sheriff.config.ts.original sheriff.config.ts

# CLI Verify Check (success)
echo 'checking for CLI verify (success scenario)'
npx sheriff verify src/main.ts > tests/actual/cli-verify-success.txt
diff tests/actual/cli-verify-success.txt tests/expected/cli-verify-success.txt

# Dynamic Import Check
echo 'checking for dynamic import error'
cp tests/dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --force --format json --output-file tests/actual/dynamic-import-lint.json
../remove-paths.mjs tests/actual/dynamic-import-lint.json
diff tests/actual/dynamic-import-lint.json tests/expected/dynamic-import-lint.json
cp sheriff.config.ts.original sheriff.config.ts

## Encapsulation Check
echo 'checking for encapsulation error'
mv src/app/customers/feature/components/customers-container.component.ts src/app/customers/feature/components/customers-container.component.ts.original
cp tests/customers-container.deep-import.component.ts src/app/customers/feature/components/customers-container.component.ts
npx ng lint --force --format json --output-file tests/actual/encapsulation-lint.json
../remove-paths.mjs tests/actual/encapsulation-lint.json
diff tests/actual/encapsulation-lint.json tests/expected/encapsulation-lint.json
mv src/app/customers/feature/components/customers-container.component.ts.original src/app/customers/feature/components/customers-container.component.ts

## Dependency Rule Check
echo 'checking for dependency rule error'
mv src/app/customers/ui/customer/customer.component.ts src/app/customers/ui/customer/customer.component.ts.original
cp tests/customer.dependency-rule.component.ts src/app/customers/ui/customer/customer.component.ts
npx ng lint --force --format json --output-file tests/actual/dependency-rule-lint.json
../remove-paths.mjs tests/actual/dependency-rule-lint.json
diff tests/actual/dependency-rule-lint.json tests/expected/dependency-rule-lint.json
mv src/app/customers/ui/customer/customer.component.ts.original src/app/customers/ui/customer/customer.component.ts

## User Error Processing
echo 'checking for user error processing'
cp tests/empty-sheriff.config.ts sheriff.config.ts
npx ng lint --force --format json --output-file tests/actual/user-error-lint.json
../remove-paths.mjs tests/actual/user-error-lint.json
diff tests/actual/user-error-lint.json tests/expected/user-error-lint.json
cp sheriff.config.ts.original sheriff.config.ts

## Auto Tagging
echo 'checking for auto tagging'
cp tests/auto-tagging.config.ts sheriff.config.ts
npx ng lint --force --format json --output-file tests/actual/auto-tagging-lint.json
../remove-paths.mjs tests/actual/auto-tagging-lint.json
diff tests/actual/auto-tagging-lint.json tests/expected/auto-tagging-lint.json
cp sheriff.config.ts.original sheriff.config.ts

## Re-Exports Check
echo 'checking for re-exports'
cp src/app/customers/api/index.ts src/app/customers/api/index.ts.original
cp tests/customer-api-re-exports.index.ts src/app/customers/api/index.ts
npx ng lint --force --format json --output-file tests/actual/re-exports-lint.json
../remove-paths.mjs tests/actual/re-exports-lint.json
diff tests/actual/re-exports-lint.json tests/expected/re-exports-lint.json
mv src/app/customers/api/index.ts.original src/app/customers/api/index.ts

## Ignore File Extensions Check
echo 'checking for ignore file extensions'
cp tests/sheriff.config-ignore-nothing.ts sheriff.config.ts
npx ng lint --lint-file-patterns '**/different-file-extension-imports.ts' --force --format json --output-file tests/actual/ignore-file-extensions-lint.json
../remove-paths.mjs tests/actual/ignore-file-extensions-lint.json
diff tests/actual/ignore-file-extensions-lint.json tests/expected/ignore-file-extensions-lint.json
cp sheriff.config.ts.original sheriff.config.ts

## Exclude From Checks Check
echo 'checking for exclude from checks'
cp tests/sheriff.config-exclude-from-checks.ts sheriff.config.ts
npx ng lint --force --format json --output-file tests/actual/exclude-from-checks-lint.json
../remove-paths.mjs tests/actual/exclude-from-checks-lint.json
diff tests/actual/exclude-from-checks-lint.json tests/expected/exclude-from-checks-lint.json
cp sheriff.config.ts.original sheriff.config.ts