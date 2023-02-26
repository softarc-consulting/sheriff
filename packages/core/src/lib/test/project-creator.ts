import { FileTree } from "./project-configurator";
import { EOL } from "os";
import * as crypto from "crypto";
import getFs from "../fs/getFs";

export class ProjectCreator {
  fs = getFs();
  create = async (fileTree: FileTree, testDirName?: string) => {
    if (testDirName === undefined) {
      testDirName = this.fs.join(
        this.fs.tmpdir(),
        "sheriff",
        crypto.randomUUID()
      );
    } else if (this.fs.exists(testDirName)) {
      await this.fs.removeDir(testDirName);
    }

    await this.fs.createDir(testDirName);
    await this.traverseFileTree(testDirName, fileTree);
  };

  traverseFileTree = async (currentDir: string, fileTree: FileTree) => {
    await this.fs.createDir(currentDir);
    for (const child in fileTree) {
      const value = fileTree[child];
      if (Array.isArray(value)) {
        await this.fs.writeFile(
          `${currentDir}/${child}`,
          value.map((imp) => `import '${imp}';`).join(EOL)
        );
      } else if (typeof value === "string") {
        await this.fs.writeFile(`${currentDir}/${child}`, value);
      } else {
        await this.traverseFileTree(`${currentDir}/${child}`, value);
      }
    }
  };
}
