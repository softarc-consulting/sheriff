import { describe, vitest } from "vitest";
import { verify } from "./verify";
import * as init from "../../lib/main/init";
import type { ProjectInfo } from "../../lib/main/init";
import { FileInfo } from "../../lib/modules/file.info";

describe("verify", (it) => {
  it("should run verify with no errors", () => {
    verify(["./src/main.ts"]);

    vitest.spyOn(init, "init").mockReturnValue({ fileInfo: {} as unknown as FileInfo } as unknown as ProjectInfo);
  })
});
