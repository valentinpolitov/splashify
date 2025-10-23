import { writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

import type { RenderResult, Writer } from "@/core/types";

const buildWriter =
  (
    extension: `.${string}`,
    renderOutput: (results: RenderResult[]) => Promise<string> | string,
  ): Writer =>
  async ({ results, defFile, outdirAbs }) => {
    const replacedExt = `${basename(defFile, extname(defFile))}${extension}`;
    const filename = extname(defFile) === extension ? defFile : replacedExt;
    const file = join(outdirAbs, filename);
    const content = await renderOutput(results);
    return writeFileSync(file, content);
  };

export { buildWriter };
