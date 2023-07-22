import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Remove absolute filepaths
function readLintWithClearedFilePaths(file: string) {
  const linterErrors: [{ filePath: string }] = JSON.parse(
    fs.readFileSync(path.join(__dirname, file), {
      encoding: 'utf-8',
    })
  );
  return JSON.stringify(
    linterErrors.map((linterError) => {
      linterError.filePath = linterError.filePath.replace(path.join(__dirname, '..'), '.');
      return linterError;
    })
  );
}

const expectedLinterErrors = readLintWithClearedFilePaths(
  'expected-dynamic-import-lint.json'
);

const generatedLinterErrors = readLintWithClearedFilePaths(
  '../dynamic-import-lint.json'
);

if (generatedLinterErrors !== expectedLinterErrors) {
  throw new Error(
    `Expected Linting failed:${os.EOL}expected:${os.EOL}${expectedLinterErrors}${os.EOL}generated:${os.EOL}${generatedLinterErrors}`
  );
} else {
  console.log('Linting output matched');
}
