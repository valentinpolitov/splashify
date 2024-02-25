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
  .option(
    "--html",
    "output HTML file with generated images tags. If no other output option is provided, this will be the default",
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
          mkdirSync(outdir);
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
          drawImage(device, image, "portrait", outdir, options),
          drawImage(device, image, "landscape", outdir, options),
        ]);

        result.push(
          {
            url: path.relative(cwd, portrait),
            media: getMediaString(device, "portrait"),
          },
          {
            url: path.relative(cwd, landscape),
            media: getMediaString(device, "landscape"),
          },
        );
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

        writeFileSync(path.join(outdir, "splashscreens.html"), html);
      }

      const resultString = JSON.stringify(result, null, 2);

      if (options.json) {
        writeFileSync(path.join(outdir, "splashscreens.json"), resultString);
      }

      if (options.cjs) {
        const ext = options.esm ? ".cjs" : ".js";

        writeFileSync(
          path.join(outdir, "splashscreens" + ext),
          [
            '/** @type {Record<"url" | "media", string>[]} */',
            `module.exports = ${resultString};`,
          ].join("\n"),
        );
      }

      if (options.esm) {
        const ext = options.cjs ? ".mjs" : ".js";

        writeFileSync(
          path.join(outdir, "splashscreens" + ext),
          [
            '/** @type {Record<"url" | "media", string>[]} */',
            `export const splashscreens = ${resultString};`,
          ].join("\n"),
        );
      }

      if (options.ts) {
        writeFileSync(
          path.join(outdir, "splashscreens.ts"),
          `export const splashscreens: Record<"url" | "media", string>[] = ${resultString};`,
        );
      }

      spinner.succeed("Done");
    } catch (error) {
      handleError(error);
    }
  });
