import {
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { loadImage } from "canvas";
import { Command } from "commander";
import ora from "ora";
import prompts from "prompts";

import { iOSDevices } from "@/devices/ios";
import { genOptionsSchema } from "@/schemas/gen";
import { drawImage } from "@/utils/canvas";
import { getDeviceString, getMediaString } from "@/utils/device";
import { handleError } from "@/utils/handle-error";
import { logger } from "@/utils/logger";

const defaultDevices = iOSDevices.map(getDeviceString);

export const gen = new Command()
  .name("generate")
  .alias("gen")
  .usage("[devices...] [options]")
  .description("Generate launch screens for web apps")
  .argument(
    "[devices...]",
    "the devices to generate launch screens for. Format: {width}x{height}@{scale}",
    defaultDevices,
  )
  .option(
    "-D, --include-defaults",
    "include default devices if provided custom ones",
    false,
  )
  .option(
    "-K, --keep-stale",
    "keep stale images in the output directory",
    false,
  )
  .option("--cwd <cwd>", "the working directory.", process.cwd())
  .option(
    "-i, --input <input>",
    "path to the image file, by default is looking for icon.svg in the working directory",
    "icon.svg",
  )
  .option(
    "-b, --bg-color <bgColor>",
    'background color for generated images. Example: "#ffffff" or "white" (default: transparent)',
  )
  .option("-s, --scale <scale>", "scale factor for the image", "0.75")
  .option(
    "-o, --outdir <outdir>",
    "output directory for generated images",
    "splashscreens",
  )
  .option("-l, --hash-length <hashLength>", "length of the hash", "8")
  .option("-p, --prefix <prefix>", "prefix for the generated images filenames")
  .option(
    "--include-orientation",
    "include orientation in the generated images filenames",
    false,
  )
  .option(
    "-N, --nofile",
    "do not include file with generated images urls and media queries",
    false,
  )
  .option(
    "-f, --file-name <fileName>",
    "output file name with generated images urls and media queries",
  )
  .option(
    "-F, --file-outdir <fileOutdir>",
    "output directory for file with generated images urls and media queries",
  )
  .option(
    "-P, --public",
    'when output directory is in public folder, this will truncate "public/" segment from generated url',
    true,
  )
  .option(
    "--html",
    "output HTML file with generated images tags. If --no-file is not specified and no other output option is provided, this will be the default",
    false,
  )
  .option(
    "--json",
    "output JSON file with generated images urls and media queries",
    false,
  )
  .option(
    "--ts",
    "generate TypeScript file with images urls and media queries",
    false,
  )
  .option(
    "--cjs",
    "generate CommonJS JavaScript file with images urls and media queries. If --esm is provided, this will be a .cjs file",
    false,
  )
  .option(
    "--esm",
    "generate ES Module JavaScript file with images urls and media queries. If --cjs is provided, this will be a .mjs file",
    false,
  )
  .action(async (devices, opts) => {
    try {
      const options = genOptionsSchema.parse({ devices, ...opts });

      const cwd = path.resolve(options.cwd);

      if (!existsSync(cwd)) {
        logger.error(`The path ${cwd} does not exist. Please try again.`);
        process.exit(1);
      }

      let imagePath = path.resolve(cwd, options.input);

      if (!existsSync(imagePath)) {
        imagePath = path.resolve(options.input);
      }

      if (!existsSync(imagePath)) {
        logger.error(
          `Image does not exist at path ${imagePath}. Please try again.`,
        );
        process.exit(1);
      }

      const outdir = path.resolve(cwd, options.outdir);

      if (!existsSync(outdir)) {
        try {
          mkdirSync(outdir, { recursive: true });
          logger.info(`Created directory ${outdir}`);
        } catch (error) {
          logger.error(
            `An error occurred while creating ${outdir} directory. Please try again.`,
          );
          logger.error(error);
          process.exit(1);
        }
      }

      if (!options.keepStale) {
        const files = readdirSync(outdir);

        if (files.length > 0) {
          const response = await prompts({
            type: "confirm",
            message: `${outdir} is not empty. Do you want to continue?`,
            name: "continue",
            initial: true,
          });

          if (!response.continue) {
            logger.warn("Generation canceled");
            logger.info("Use --keep-stale to keep existing images");
            process.exit(1);
          }

          for (const file of files) {
            unlinkSync(path.join(outdir, file));
          }
        }
      }

      const spinner = ora("Generating launch screens").start();

      const image = await loadImage(imagePath);

      const result: Record<"url" | "media", string>[] = [];

      for (const device of options.devices) {
        const [portrait, landscape] = await Promise.all([
          drawImage(device, image, "portrait", options),
          drawImage(device, image, "landscape", options),
        ]);

        if (options.nofile) continue;

        result.push(
          {
            url: portrait,
            media: getMediaString(device, "portrait"),
          },
          {
            url: landscape,
            media: getMediaString(device, "landscape"),
          },
        );
      }

      if (options.nofile) {
        spinner.succeed("Done");
        return;
      }

      const fileName = options.fileName || "splashscreens";
      let filePath = outdir;

      if (options.fileOutdir) {
        filePath = path.resolve(cwd, options.fileOutdir);

        if (!existsSync(filePath)) {
          try {
            mkdirSync(filePath, { recursive: true });
            logger.info(`Created directory ${filePath}`);
          } catch (error) {
            logger.error(
              `An error occurred while creating ${filePath} directory. File will be saved in ${outdir} directory.`,
            );
            filePath = outdir;
          }
        }
      }

      if (
        options.html ||
        (!options.json && !options.ts && !options.cjs && !options.esm)
      ) {
        const html = result
          .map(
            (screen) =>
              `<link rel="apple-touch-startup-image" href="${screen.url}" media="${screen.media}">`,
          )
          .join("\n");

        const file = path.join(
          filePath,
          path.extname(fileName) === ".html" ? fileName : fileName + ".html",
        );

        writeFileSync(file, html);
      }

      const resultString = JSON.stringify(result, null, 2);

      if (options.json) {
        const file = path.join(
          filePath,
          path.extname(fileName) === ".json" ? fileName : fileName + ".json",
        );

        writeFileSync(file, resultString);
      }

      if (options.cjs) {
        const ext = options.esm ? ".cjs" : ".js";

        const file = path.join(
          filePath,
          path.extname(fileName) === ext ? fileName : fileName + ext,
        );

        writeFileSync(
          file,
          [
            '/** @type {Record<"url" | "media", string>[]} */',
            `module.exports = ${resultString};`,
          ].join("\n"),
        );
      }

      if (options.esm) {
        const ext = options.cjs ? ".mjs" : ".js";

        const file = path.join(
          filePath,
          path.extname(fileName) === ext ? fileName : fileName + ext,
        );

        writeFileSync(
          file,
          [
            '/** @type {Record<"url" | "media", string>[]} */',
            `export const splashscreens = ${resultString};`,
          ].join("\n"),
        );
      }

      if (options.ts) {
        const file = path.join(
          filePath,
          path.extname(fileName) === ".ts" ? fileName : fileName + ".ts",
        );

        writeFileSync(
          file,
          `export const splashscreens: Record<"url" | "media", string>[] = ${resultString};`,
        );
      }

      spinner.succeed("Done");
    } catch (error) {
      handleError(error);
    }
  });
