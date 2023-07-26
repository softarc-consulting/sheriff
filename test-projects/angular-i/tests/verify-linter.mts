import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {fileURLToPath} from 'url';

const expectedFile = process.argv[2];
const actualFile = process.argv[3];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Remove absolute filepaths
function readLintWithClearedFilePaths(file: string) {
  const linterErrors: [{ filePath: string }] = JSON.parse(
    fs.readFileSync(file, {
      encoding: 'utf-8',
    })
  );
  return JSON.stringify(
    linterErrors.map((linterError) => {
      linterError.filePath = linterError.filePath.replace( /.*\/test-projects\/angular-i\// , './');
      return linterError;
    })
  );
}



const expectedLinterErrors = readLintWithClearedFilePaths(path.join(__dirname, expectedFile));
const generatedLinterErrors = readLintWithClearedFilePaths(path.join(__dirname, '..', actualFile));

if (generatedLinterErrors !== expectedLinterErrors) {
  throw new Error(
    `Expected Linting failed:${os.EOL}expected:${os.EOL}${expectedLinterErrors}${os.EOL}generated:${os.EOL}${generatedLinterErrors}`
  );
} else {
  console.log('Linting output matched');
}
