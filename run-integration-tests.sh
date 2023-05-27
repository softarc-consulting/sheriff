cd test-projects
cd angular-i
yarn
cp dynamic-import-sheriff.config.ts sheriff.config.ts
npx ng lint --output-file dynamic-import-lint.txt
cmp dynamic-import-lint.txt expected-dynamic-import-lint.txt
if [ $? -eq 0 ]; then
    exit 0
else
    exit 1
fi
