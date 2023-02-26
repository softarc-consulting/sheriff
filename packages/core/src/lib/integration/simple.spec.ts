import { FileTree } from "../test/project-configurator";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ProjectCreator } from "../test/project-creator";
import getFs, { useVirtualFs } from "../fs/getFs";
import generateFileInfo from "../file-info/generate-file-info";
import tsconfigMinimal from "../test/fixtures/tsconfig.minimal";
import Fs from "../fs/fs";

const projectConfig: FileTree = {
  "tsconfig.json": tsconfigMinimal,
  "src/app": {
    "home.component.ts": [],
    "app.component.ts": ["./home.component"],
  },
};

describe("Simple Config", () => {
  let creator: ProjectCreator;
  let fs: Fs;

  beforeAll(() => {
    useVirtualFs();
    fs = getFs();
  });

  beforeEach(() => {
    creator = new ProjectCreator();
  });

  it("should generate the files", async () => {
    await creator.create(projectConfig);
  });

  it("should generate the file info", async () => {
    await creator.create(projectConfig, "integration");

    const fileInfo = await generateFileInfo(
      "integration/src/app/app.component.ts",
      "integration/tsconfig.json"
    );

    expect(fileInfo).toEqual({
      path: "integration/src/app/app.component.ts",
      imports: [{ path: "integration/src/app/home.component.ts", imports: [] }],
    });
  });
});
