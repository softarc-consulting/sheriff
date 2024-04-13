import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";

const expectedFile = process.argv[2];
const actualFile = process.argv[3];
const projectPath = process.argv[4];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Remove absolute filepaths
function readLintWithClearedFilePaths(file) {
  let content = fs.readFileSync(file, {
    encoding: "utf-8"
  });
  if (projectPath) {
   content = content.replaceAll(projectPath, 'PROJECT_DIR')
  }
  const linterErrors = JSON.parse(content);

  return JSON.stringify(
    linterErrors.map((linterError) => {
      linterError.filePath = linterError.filePath.replace(/.*\/test-projects\//, "./");
      return linterError;
    })
  );
}

const expectedLinterErrors = readLintWithClearedFilePaths(path.join(__dirname, expectedFile));
const generatedLinterErrors = readLintWithClearedFilePaths(path.join(__dirname, actualFile));

if (generatedLinterErrors !== expectedLinterErrors) {
  const formattedExpected = JSON.stringify(JSON.parse(expectedLinterErrors), null, " ");
  const formattedGenerated = JSON.stringify(JSON.parse(generatedLinterErrors), null, " ");
  throw new Error(
    `Expected Linting failed:${os.EOL}expected:${os.EOL}${formattedExpected}${os.EOL}generated:${os.EOL}${formattedGenerated}`
  );
}
