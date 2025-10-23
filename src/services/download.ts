import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import ora from "ora";

import { logger } from "@/util/logger";

class BadImageException extends Error {
  name = "BadImageException";
}

async function downloadImage(url: string): Promise<string> {
  const spinner = ora(`Fetching the image from ${url}`).start();

  try {
    const downloadsDir = join(process.cwd(), ".splashify", "downloads");
    if (!existsSync(downloadsDir)) mkdirSync(downloadsDir, { recursive: true });

    const parsed = new URL(url);
    const file = parse(parsed.pathname);
    const hash = createHash("shake256", { outputLength: 8 })
      .update(url)
      .digest("hex");
    const imagePath = join(
      downloadsDir,
      `${file.name || "image"}-${hash}${file.ext || ""}`,
    );

    if (existsSync(imagePath)) {
      spinner.succeed(`Image already downloaded at ${imagePath}`);
      return imagePath;
    }

    const res = await fetch(url);
    const type = res.headers.get("content-type") || "";
    const len = parseInt(res.headers.get("content-length") || "", 10);

    if (!type.includes("image"))
      throw new BadImageException("The URL does not point to an image");
    if (!/(image\/(jpeg|png|svg\+xml))/.test(type))
      throw new BadImageException("Image type is not supported");
    if (Number.isFinite(len)) {
      if (len <= 0) throw new BadImageException("Image is empty");
      if (len > 10 * 1024 * 1024)
        throw new BadImageException("Image is too large");
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(imagePath, buffer);

    spinner.succeed(`Image fetched and saved at ${imagePath}`);
    return imagePath;
  } catch (error) {
    spinner.fail(
      error instanceof Error ? error.message : `Failed to fetch: ${url}`,
    );
    logger.error("Generation aborted.");
    process.exit(1);
  }
}

export { BadImageException, downloadImage };
