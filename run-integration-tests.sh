cd test-projects
cd angular-i
yarn
cp dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --format json --output-file dynamic-import-lint.json
cmp dynamic-import-lint.json expected-dynamic-import-lint.json
if [ $? -eq 0 ]; then
    exit 0
else
    exit 1
fi
