import { readFileSync } from "node:fs";
import path from "node:path";

import { downloadImage } from "@/services/download";
import { resolveCwd } from "@/util/paths";

const SUP = [".svg", ".png", ".jpg", ".jpeg"];

async function loadSource(input: string, cwd: string): Promise<Buffer> {
  const isUrl = /^(https?|ftp):\/\//i.test(input);
  const abs = isUrl ? await downloadImage(input) : resolveCwd(cwd, input);
  const ext = path.extname(abs).toLowerCase();
  if (!SUP.includes(ext)) throw new Error(`Unsupported image type: ${ext}`);
  return readFileSync(abs);
}

export { loadSource };
