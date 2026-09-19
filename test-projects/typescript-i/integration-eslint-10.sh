#!/bin/bash
set -e

# Reuse the fixture in isolation so its ESLint 8 dependencies remain unchanged.
eslint10_directory=../typescript-eslint-10
mkdir -p "$eslint10_directory"
cp -R src sheriff.config.ts tsconfig.json "$eslint10_directory/"
cd "$eslint10_directory"

printf '{"private": true}\n' > package.json
npm install --save-dev eslint@10 typescript-eslint@8.60.1 typescript@6.0.3
yalc add @softarc/sheriff-core @softarc/eslint-plugin-sheriff

echo 'Testing with TypeScript 6, ESLint 10 (Flat)'
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { relative } from 'node:path';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import sheriff from '@softarc/eslint-plugin-sheriff';

assert.match(ESLint.version, /^10\./);
const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [{
    ...sheriff.configs.all,
    languageOptions: { parser: tseslint.parser },
  }],
});
const results = await eslint.lintFiles('src');
const messages = results.flatMap(result => result.messages.map(message => ({
  file: relative(process.cwd(), result.filePath),
  rule: message.ruleId,
  severity: message.severity,
  message: message.message,
})));
assert.deepEqual(messages, [
  {
    file: 'src/main.ts',
    rule: '@softarc/sheriff/encapsulation',
    severity: 2,
    message: "'@app/web/checkout-controller' is a deep import from a barrel module. Use the module's barrel file (index.ts) instead.",
  },
  {
    file: 'src/web/checkout-controller.ts',
    rule: '@softarc/sheriff/dependency-rule',
    severity: 2,
    message: 'module /src/web cannot access /src/data. Tag web has no clearance for tags data',
  },
]);
console.log(`ESLint ${ESLint.version}: expected Sheriff violations verified`);
JS
