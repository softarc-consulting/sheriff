import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';

const results = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const messages = results.flatMap(result => result.messages.map(message => ({
  file: relative(process.cwd(), result.filePath).split('\\').join('/'),
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
console.log('Expected Sheriff violations verified');
