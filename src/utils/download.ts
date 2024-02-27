import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import ora from "ora";

import { logger } from "./logger";

class BadImageException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadImageException";
  }
}

export async function downloadImage(url: string, cwd: string): Promise<string> {
  const spinner = ora(`Fetching the image from ${url}`);

  try {
    spinner.start();
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (!contentType) {
      throw new BadImageException("Content-Type header is missing");
    }

    if (!contentType.includes("image")) {
      throw new BadImageException("The URL does not point to an image");
    }

    if (
      !["image/jpeg", "image/png", "image/svg+xml"].some((type) =>
        contentType.includes(type),
      )
    ) {
      throw new BadImageException("Image type is not supported");
    }

    if (contentLength) {
      const parsedLength = parseInt(contentLength, 10);

      if (parsedLength <= 0) {
        throw new BadImageException("Image is empty");
      }

      if (parsedLength > 10 * 1024 * 1024) {
        throw new BadImageException("Image is too large");
      }
    }

    const buffer = await response.arrayBuffer();
    const imagePath = path.join(cwd, randomUUID() + path.extname(url));

    const nodeBuffer = Buffer.from(buffer);
    writeFileSync(imagePath, nodeBuffer);

    spinner.succeed(`Image fetched and saved at ${imagePath}`);

    return imagePath;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `An error occurred while fetching the image from ${url}. Please try again.`;

    spinner.fail(message);
    logger.error("Generations aborted.");
    process.exit(1);
  }
}
