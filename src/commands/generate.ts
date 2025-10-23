import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";

import { mapOptionsToRunConfig } from "@/compat/options-map";
import { runPipeline } from "@/core/run";
import { presetIOS } from "@/devices/preset-ios";
import { sharpRenderer } from "@/renderers/sharp-renderer";
import { genOptionsSchema } from "@/schema/gen";
import { deviceToString } from "@/util/devices";
import { logger } from "@/util/logger";
import { manageExistingFiles } from "@/util/manage-files";
import { writeDefinitions } from "@/writers/orchestrator";

const defaultDevices = presetIOS.map(deviceToString);

const command = new Command()
  .name("generate")
  .alias("gen")
  .usage("[devices...] [options]")
  .description(
    chalk.bgCyan(
      chalk.gray(chalk.bold(" Generate launch screens for web apps ")),
    ),
  )
  .argument(
    "[devices...]",
    [
      "devices to generate launch screens for. Format: ",
      chalk.italic("{width}"),
      chalk.bold("x"),
      chalk.italic("{height}"),
      chalk.bold("@"),
      chalk.italic("{dpi}"),
    ].join(""),
    defaultDevices,
  )
  .option("-i, --input <path|url>", "path or url to the image file", "icon.svg")
  .option(
    "-b, --background <color>",
    'background color (e.g. "#ffffff" or cyan)',
  )
  .option("-s, --scale <scale>", "scale factor", "0.75")
  .option(
    "-o, --outdir <path>",
    "output dir",
    path.join(".splashify", "images"),
  )
  .option("-N, --no-def", "do not write definitions")
  .option("-f, --def-file <name>", "definitions base name", "resources")
  .option("-F, --def-outdir <path>", "definitions dir", ".splashify")
  .option("-D, --include-defaults", "include default devices", false)
  .option("-C, --clean", "clean output dir", false)
  .option("-K, --keep", "keep existing files", false)
  .option("-l, --hash-length <n>", "hash length", "8")
  .option("-p, --prefix <prefix>", "filename prefix")
  .option("--include-orientation", "append orientation to filenames", false)
  .option("--cwd <cwd>", "working directory", process.cwd())
  .option(
    "--public",
    'strip leading "public/" in URLs when outdir is under public',
    true,
  )
  .option("--portrait-only", "only portrait", false)
  .option("--landscape-only", "only landscape", false)
  .option("--json", "write JSON", false)
  .option("--ts", "write TypeScript", false)
  .option("--js", "write ESM (.mjs)", false)
  .option("--esm", "alias for --js", false)
  .option("--cjs", "write CommonJS (.cjs)", false)
  .option("--html", "write HTML (default when none selected)", false)
  .action(
    async (devices: string[], opts: Record<string, unknown>): Promise<void> => {
      const spinner = ora("Validating options").start();
      try {
        const parsed = genOptionsSchema.parse({ devices, ...opts });
        const cfg = mapOptionsToRunConfig(parsed);

        if (cfg.portraitOnly && cfg.landscapeOnly) {
          spinner.fail("Both --portrait-only and --landscape-only are set.");
          process.exit(1);
        }

        const cwd = path.resolve(cfg.cwd);
        if (!existsSync(cwd)) {
          spinner.fail(`The path ${cwd} does not exist.`);
          process.exit(1);
        }

        const outdirAbs = path.resolve(cwd, cfg.outdir);
        if (!existsSync(outdirAbs)) {
          mkdirSync(outdirAbs, { recursive: true });
          logger.info(`Created directory ${outdirAbs}`);
        }
        await manageExistingFiles(outdirAbs, parsed);

        spinner.text = "Rendering launch screens";
        const results = await runPipeline(cfg, sharpRenderer);

        if (!cfg.write.def) {
          spinner.succeed("Done");
          return;
        }

        spinner.text = "Writing definitions";
        let defOutdirAbs = path.resolve(cwd, cfg.defOutdir);
        if (!existsSync(defOutdirAbs)) {
          try {
            mkdirSync(defOutdirAbs, { recursive: true });
            logger.info(`Created directory ${defOutdirAbs}`);
          } catch {
            logger.warn(
              `Failed to create ${defOutdirAbs}. Using ${outdirAbs} instead.`,
            );
            defOutdirAbs = outdirAbs;
          }
        }

        await writeDefinitions(results, cfg, defOutdirAbs);

        spinner.succeed("Done");
      } catch (e) {
        spinner.stop();
        const { handleError } = await import("@/util/handle-error");
        handleError(e);
      }
    },
  );

export { command as generate };
