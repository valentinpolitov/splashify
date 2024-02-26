import { readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import prompts from "prompts";

import type { GenOptions } from "@/schemas/gen";
import { logger } from "@/utils/logger";

function removeFiles(dir: string, files: string[]): void {
  for (const file of files) {
    try {
      unlinkSync(join(dir, file));
    } catch {
      logger.warn(`Failed to remove ${file}`);
    }
  }
}

export async function manageExistingFiles(
  outdir: string,
  options: GenOptions,
): Promise<void> {
  const files = readdirSync(outdir);

  if (files.length === 0) return;

  if (options.keep && options.clean) {
    logger.warn(
      "You have specified both --keep and --clean options, which is contradictory.",
    );

    const response = await prompts(
      {
        type: "toggle",
        name: "value",
        message: `${outdir} is not empty. What do you want to do?`,
        initial: true,
        active: "Clean output directory",
        inactive: "Keep existing files",
      },
      {
        onCancel: () => {
          logger.warn("Generation canceled");
          process.exit(1);
        },
      },
    );

    if (response.value) {
      removeFiles(outdir, files);
    }

    return;
  }

  if (options.keep) return;

  if (options.clean) return removeFiles(outdir, files);

  const response = await prompts({
    type: "confirm",
    message: `${outdir} is not empty. Do you want to continue and potentially overwrite existing files?`,
    name: "continue",
    initial: true,
  });

  if (!response.continue) {
    logger.warn("Generation canceled");
    logger.info("Use --keep option to keep existing files");
    process.exit(1);
  }

  logger.info(
    "Use --clean option to epmty the output directory before generation",
  );
}
