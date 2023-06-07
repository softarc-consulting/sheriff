const fs = require('fs');
const os = require('os');

// Absolute filepaths has to be stripped from
// lint output.
function readLintWithClearedFilePaths(file) {
  const linterErrors = JSON.parse(
    fs.readFileSync(__dirname + file, {
      encoding: 'utf-8',
    })
  );
  return JSON.stringify(
    linterErrors.map((linterError) => {
      linterError.filePath.replace(__dirname, '/');
      console.log(linterError);
      return linterError;
    })
  );
}

let expectedLinterErrors = readLintWithClearedFilePaths(
  '/expected-dynamic-import-lint.json'
);

let generatedLinterErrors = readLintWithClearedFilePaths(
  '/../dynamic-import-lint.json'
);

if (generatedLinterErrors !== expectedLinterErrors) {
  throw new Error(
    `Expected Linting failed:${os.EOL}expected:${os.EOL}${expectedLinterErrors}${os.EOL}generated:${os.EOL}${generatedLinterErrors}`
  );
} else {
  ('Linting output matched');
}
