import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createCanvas, type Image } from "canvas";

import type { GenOptions } from "@/schemas/gen";
import type { Device } from "@/utils/device";

function hashHex(s: string, hexLength: number): string {
  const bytes = Math.max(1, Math.ceil(hexLength / 2)); // hex chars -> bytes
  const h = createHash("shake256", { outputLength: bytes });
  h.update(s);
  return h.digest("hex").slice(0, hexLength);
}

export async function drawImage(
  device: Device,
  image: Image,
  orientation: "portrait" | "landscape",
  options: GenOptions,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const [resolvedWidth, resolvedHeight] = (
      orientation === "portrait"
        ? [device.width, device.height]
        : [device.height, device.width]
    ).map((length) => Math.max(1, Math.round(length * device.dpi)));

    const canvas = createCanvas(resolvedWidth, resolvedHeight);
    const ctx = canvas.getContext("2d");

    if (options.background && options.background !== "transparent") {
      ctx.fillStyle = options.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // High quality resampling
    ctx.imageSmoothingEnabled = true;

    const baseRatio = Math.min(
      canvas.width / image.width,
      canvas.height / image.height,
    );
    const ratio = baseRatio * options.scale;
    const dw = Math.max(1, Math.round(image.width * ratio));
    const dh = Math.max(1, Math.round(image.height * ratio));
    const dx = Math.round((canvas.width - dw) / 2);
    const dy = Math.round((canvas.height - dh) / 2);

    ctx.drawImage(image, dx, dy, dw, dh);

    let inputStat = "";
    const absInputPath = path.isAbsolute(options.input)
      ? options.input
      : path.resolve(options.cwd, options.input);
    try {
      const st = fs.statSync(absInputPath);
      inputStat = `${st.size}:${st.mtimeMs}`;
    } catch {
      // ignore; may be URL/Buffer. Can also inject a content hash upstream.
      try {
        // as a last resort, if it's a local file, hash bytes
        inputStat = fs.readFileSync(absInputPath).byteLength.toString();
      } catch {
        inputStat = options.input; // final fallback
      }
    }

    const seed = [
      inputStat,
      options.background || "transparent",
      canvas.width,
      canvas.height,
      device.dpi,
      orientation,
      options.scale,
    ].join(":");

    const filename =
      [
        options.prefix ||
          path.basename(options.input, path.extname(options.input)),
        hashHex(seed, options.hashLength),
        options.includeOrientation ? orientation : null,
      ]
        .filter(Boolean)
        .join("-") + ".png";

    const cwd = path.resolve(options.cwd);
    const filePath = path.join(path.resolve(cwd, options.outdir), filename);

    const outStream = fs.createWriteStream(filePath);
    const pngStream = canvas.createPNGStream();

    const onError = (err: unknown): void => {
      const error = err instanceof Error ? err : new Error(String(err));
      try {
        outStream.destroy(error);
      } catch {}
      reject(error);
    };

    outStream.on("error", onError);
    pngStream.on("error", onError);

    let url = path.relative(cwd, filePath);

    if (options.public) {
      const [segment, ...rest] = url.split(path.sep);

      if (segment === "public") {
        url = path.join(...rest);
      }
    }

    outStream.on("finish", () => resolve(url));
    pngStream.pipe(outStream);
  });
}
