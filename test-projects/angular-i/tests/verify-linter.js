const fs = require('fs');

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
console.log(expectedLinterErrors);

let generatedLinterErrors = readLintWithClearedFilePaths(
  '/../dynamic-import-lint.json'
);
console.log(generatedLinterErrors);
