import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadImage } from "canvas";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginHTML from "prettier/plugins/html";
import prettierPluginTypescript from "prettier/plugins/typescript";
import prettier from "prettier/standalone";

import { iOSDevices } from "@/devices/ios";
import { genOptionsSchema } from "@/schemas/gen";
import { drawImage } from "@/utils/canvas";
import { getDeviceString, getMediaString } from "@/utils/device";
import { downloadImage } from "@/utils/download";
import { handleError } from "@/utils/handle-error";
import { logger } from "@/utils/logger";
import { manageExistingFiles } from "@/utils/manage-existing-files";

const defaultDevices = iOSDevices.map(getDeviceString);

export const gen = new Command()
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
  .option(
    "-i, --input <path|url>",
    "path or url to the image file, by default is looking for icon.svg in the working directory",
    "icon.svg",
  )
  .option(
    "-b, --background <color>",
    'background color for generated images. Example: "#ffffff" or cyan (default: transparent)',
  )
  .option("-s, --scale <scale>", "scale factor for the image", "0.75")
  .option(
    "-o, --outdir <path>",
    "output directory for generated images",
    path.join(".splashify", "images"),
  )
  .option("-N, --no-def", "do not include file with resource definitions")
  .option(
    "-f, --def-file <fileName>",
    "resource definitions file name",
    "resources",
  )
  .option(
    "-F, --def-outdir <path>",
    "output directory for generated resource definitions",
    ".splashify",
  )
  .option(
    "-D, --include-defaults",
    "include default devices if provided custom ones",
    false,
  )
  .option("-C, --clean", "remove existing files in the output directory", false)
  .option("-K, --keep", "keep existing files in the output directory", false)
  .option("-l, --hash-length <hashLength>", "length of the hash", "8")
  .option("-p, --prefix <prefix>", "prefix for the generated images filenames")
  .option(
    "--include-orientation",
    "include orientation in the generated images filenames",
    false,
  )
  .option("--cwd <cwd>", "the working directory.", process.cwd())
  .option(
    "--public",
    'when output directory is in public folder, this will truncate "public/" segment from generated url',
    true,
  )
  .option("--portrait-only", "generate only portrait images", false)
  .option("--landscape-only", "generate only landscape images", false)
  .option("--json", "generate JSON file with resource definitions", false)
  .option("--ts", "generate TypeScript file with resource definitions", false)
  .option("--js", "generate JavaScript file with resource definitions", false)
  .option(
    "--esm",
    "generate ES Module JavaScript file with resource definitions",
    false,
  )
  .option(
    "--cjs",
    "generate CommonJS JavaScript file with resource definitions",
    false,
  )
  .option(
    "--html",
    [
      "generate HTML file with resource definitions.",
      chalk.italic(
        "If --no-def is not specified and no other definition variant is provided, this will be the default",
      ),
    ].join(" "),
    false,
  )
  .action(async (devices, opts) => {
    try {
      const options = genOptionsSchema.parse({ devices, ...opts });

      if (options.portraitOnly && options.landscapeOnly) {
        logger.error(
          "You cannot use --portrait-only and --landscape-only flags at the same time. Please try again.",
        );
        process.exit(1);
      }

      const cwd = path.resolve(options.cwd);

      if (!existsSync(cwd)) {
        logger.error(`The path ${cwd} does not exist. Please try again.`);
        process.exit(1);
      }

      let imagePath = path.resolve(cwd, options.input);

      const isUrl = ["https://", "http://", "ftp://"].some((protocol) =>
        options.input.startsWith(protocol),
      );

      if (isUrl) {
        imagePath = await downloadImage(options.input);
      }

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

      await manageExistingFiles(outdir, options);

      const spinner = ora("Generating launch screens").start();

      const image = await loadImage(imagePath);

      const screen = options.devices.reduce(
        (result, device, index) => {
          const pxWidth = device.width * device.dpi;

          if (index === 0) {
            result.widest = pxWidth;
            result.smallest = pxWidth;
            return result;
          }

          if (result.widest < pxWidth) {
            result.widest = pxWidth;
          }

          if (result.smallest > pxWidth) {
            result.smallest = pxWidth;
          }

          return result;
        },
        { widest: 0, smallest: 0 },
      );

      // Scale SVG image to fit the widest device
      if (
        path.extname(imagePath).toLowerCase() === ".svg" &&
        Number.isFinite(image.width) &&
        image.width > 0
      ) {
        const factor = screen.widest / image.width;
        image.height = Math.round(image.height * factor);
        image.width = screen.widest;
      }

      const smallImageNote =
        image.width < screen.smallest * options.scale
          ? "Provided image is too small. Result may not match the expected quality."
          : null;

      if (smallImageNote) {
        spinner.suffixText = chalk.bgYellow(chalk.red(smallImageNote));
      }

      const result: Record<"url" | "media", string>[] = [];

      for (const device of options.devices) {
        // If the device is a square, we can use the same image for both orientations and ignore orientation flags
        if (device.width === device.height) {
          const imageUrl = await drawImage(device, image, "portrait", options);

          if (!options.def) continue;

          result.push({ url: imageUrl, media: getMediaString(device) });

          continue;
        }

        const [portraitUrl, landscapeUrl] = await Promise.all([
          options.landscapeOnly
            ? null
            : drawImage(device, image, "portrait", options),
          options.portraitOnly
            ? null
            : drawImage(device, image, "landscape", options),
        ]);

        if (!options.def) continue;

        if (portraitUrl) {
          result.push({
            url: portraitUrl,
            media: getMediaString(device, "portrait"),
          });
        }

        if (landscapeUrl) {
          result.push({
            url: landscapeUrl,
            media: getMediaString(device, "landscape"),
          });
        }
      }

      spinner.suffixText = "";

      if (!options.def) {
        spinner.succeed("Done");

        if (smallImageNote) {
          logger.warn(smallImageNote);
        }
        return;
      }

      spinner.text = "Generating file with images urls and media queries";

      let defOutdir = path.resolve(cwd, options.defOutdir);

      if (!existsSync(defOutdir)) {
        try {
          mkdirSync(defOutdir, { recursive: true });
          logger.info(`Created directory ${defOutdir}`);
        } catch {
          logger.error(
            `An error occurred while creating ${defOutdir} directory. File will be saved in ${outdir} directory.`,
          );
          defOutdir = outdir;
        }
      }

      const noJsFilesOutput =
        !options.ts && !options.js && !options.cjs && !options.esm;

      const noFilesOutput = !options.html && !options.json && noJsFilesOutput;

      if (options.html || noFilesOutput) {
        const links = result.map(
          (screen) =>
            `<link rel="apple-touch-startup-image" href="${screen.url}" media="${screen.media}">`,
        );

        const html = await prettier.format(links.join("\n"), {
          parser: "html",
          plugins: [prettierPluginHTML],
        });

        const file = path.join(
          defOutdir,
          path.extname(options.defFile) === ".html"
            ? options.defFile
            : options.defFile + ".html",
        );

        writeFileSync(file, html);
      }

      if (noFilesOutput) {
        spinner.succeed("Done");

        if (smallImageNote) {
          logger.warn(smallImageNote);
        }
        return;
      }

      const json = JSON.stringify(result, null, 2) as `[${string}]`;

      if (options.json) {
        const file = path.join(
          defOutdir,
          path.extname(options.defFile) === ".json"
            ? options.defFile
            : options.defFile + ".json",
        );

        writeFileSync(file, json);
      }

      if (noJsFilesOutput) {
        spinner.succeed("Done");

        if (smallImageNote) {
          logger.warn(smallImageNote);
        }
        return;
      }

      const extensions = (
        [
          options.ts && ".ts",
          options.js && ".js",
          options.esm && ".mjs",
          options.cjs && ".cjs",
        ] as const
      ).filter(Boolean);

      for (const ext of extensions) {
        const file = path.join(
          defOutdir,
          path.extname(options.defFile) === ext
            ? options.defFile
            : options.defFile + ext,
        );

        const resType = 'Record<"url" | "media", string>[]';
        const [header, typeAnnotation] =
          ext === ".ts"
            ? (["", `: ${resType}`] as const)
            : ([`/** @type {${resType}} */`, ""] as const);

        const footer =
          ext === ".cjs"
            ? "module.exports = { resources }"
            : "export { resources }";

        const content = [
          header,
          `const resources${typeAnnotation} = ${json}\n`,
          footer,
        ].join("\n");

        const data = await prettier.format(content, {
          parser: ext === ".ts" ? "typescript" : "babel",
          plugins: [
            prettierPluginBabel,
            prettierPluginEstree,
            prettierPluginTypescript,
          ],
        });

        writeFileSync(file, data);
      }

      spinner.succeed("Done");

      if (smallImageNote) {
        logger.warn(smallImageNote);
      }
    } catch (error) {
      handleError(error);
    }
  });
