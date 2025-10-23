import type { RenderResult, RunConfig } from "@/core/types";
import { writeCjs } from "@/writers/cjs";
import { writeEsm } from "@/writers/esm";
import { writeHtml } from "@/writers/html";
import { writeJson } from "@/writers/json";
import { writeTs } from "@/writers/ts";

async function writeDefinitions(
  results: RenderResult[],
  cfg: RunConfig,
  defOutdirAbs: string,
): Promise<void> {
  const noJs = !cfg.write.ts && !cfg.write.esm && !cfg.write.cjs;
  const noFiles = !cfg.write.html && !cfg.write.json && noJs;

  if (cfg.write.html || noFiles) {
    await writeHtml({
      results,
      defFile: cfg.write.defFile,
      outdirAbs: defOutdirAbs,
    });
  }

  if (noFiles) return;

  if (cfg.write.json) {
    await writeJson({
      results,
      defFile: cfg.write.defFile,
      outdirAbs: defOutdirAbs,
    });
  }

  if (cfg.write.ts) {
    await writeTs({
      results,
      defFile: cfg.write.defFile,
      outdirAbs: defOutdirAbs,
    });
  }

  if (cfg.write.esm) {
    await writeEsm({
      results,
      defFile: cfg.write.defFile,
      outdirAbs: defOutdirAbs,
    });
  }

  if (cfg.write.cjs) {
    await writeCjs({
      results,
      defFile: cfg.write.defFile,
      outdirAbs: defOutdirAbs,
    });
  }
}

export { writeDefinitions };
