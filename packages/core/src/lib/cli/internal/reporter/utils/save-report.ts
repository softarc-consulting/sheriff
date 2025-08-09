import getFs from '../../../../fs/getFs';
import { DEFAULT_PROJECT_NAME } from '../../get-entries-from-cli-or-config';
import { ReporterOptions } from './reporter-options';

/**
 * Saves content to a file, creating the directory structure if needed
 * @param options Reporter options containing outputDir and projectName
 * @param fileName The base filename for the report
 * @param extension The file extension including the dot
 * @param content The content to write to the file
 */
export function saveReport(
  options: ReporterOptions,
  fileName: string,
  extension: string,
  content: string,
): void {
  const fs = getFs();

  createReportDirectory(options);
  const targetPath = getReportTargetPath(options, fileName, extension);
  fs.writeFile(targetPath, content);
}

function getReportTargetPath(
  options: ReporterOptions,
  fileName: string,
  extension: string,
): string {
  const fs = getFs();

  if (options.projectName === DEFAULT_PROJECT_NAME) {
    return fs.join(options.outputDir, fileName + extension);
  }

  return fs.join(options.outputDir, options.projectName, fileName + extension);
}

function createReportDirectory(options: ReporterOptions): void {
  const fs = getFs();

  if (options.projectName === DEFAULT_PROJECT_NAME) {
    fs.createDir(options.outputDir);
  } else {
    fs.createDir(fs.join(options.outputDir, options.projectName));
  }
}
