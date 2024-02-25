import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { createCanvas, type Image } from "canvas";

import type { GenOptions } from "@/schemas/gen";
import type { Device } from "@/utils/device";

export function drawImage(
  device: Device,
  image: Image,
  orientation: "portrait" | "landscape",
  options: GenOptions,
): Promise<string> {
  return new Promise<string>((resolve) => {
    const [width, height] =
      orientation === "portrait"
        ? [device.width, device.height]
        : [device.height, device.width];

    const canvas = createCanvas(width * device.dpi, height * device.dpi);
    const ctx = canvas.getContext("2d");

    if (options.bgColor && options.bgColor !== "transparent") {
      ctx.fillStyle = options.bgColor;
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let dw: number, dh: number;

    if (canvas.width < canvas.height) {
      dw = canvas.width * options.scale;
      dh = (dw / image.width) * image.height;
    } else {
      dh = canvas.height * options.scale;
      dw = (dh / image.height) * image.width;
    }

    const dx = (canvas.width - dw) / 2;
    const dy = (canvas.height - dh) / 2;

    ctx.drawImage(image, dx, dy, dw, dh);

    const hash = createHash("shake256", { outputLength: options.hashLength });
    hash.update(
      [
        options.input,
        options.bgColor || "transparent",
        width,
        height,
        device.dpi,
        orientation,
      ].join(":"),
    );

    let filename = hash.digest("hex");
    if (options.prefix) {
      filename = `${options.prefix}-${filename}`;
    }
    if (options.includeOrientation) {
      filename += `-${orientation}`;
    }
    filename += ".png";

    const cwd = path.resolve(options.cwd);
    const filePath = path.join(path.resolve(cwd, options.outdir), filename);

    const stream = createWriteStream(filePath);
    canvas.createPNGStream().pipe(stream);

    let url = path.relative(cwd, filePath);

    if (options.public) {
      const [segment, ...rest] = url.split(path.sep);

      if (segment === "public") {
        url = path.join(...rest);
      }
    }

    stream.on("finish", () => resolve(url));
  });
}
