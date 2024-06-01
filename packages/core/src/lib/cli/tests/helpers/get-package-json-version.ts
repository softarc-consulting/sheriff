import * as path from 'path';
import * as fs from 'fs';

export function getPackageJsonVersion(): string {
  const packageJsonPath = path.resolve(
    __dirname,
    '../../../../../package.json',
  );
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')).version;
}
