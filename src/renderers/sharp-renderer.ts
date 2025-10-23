import { existsSync, mkdirSync } from "node:fs";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import sharp from "sharp";

import type { Renderer } from "@/core/types";
import { hashHex } from "@/util/hash";
import { toPosix } from "@/util/paths";

export const sharpRenderer: Renderer = async ({ src, job, cfg }) => {
  const { device, orientation } = job;
  const [w, h] =
    orientation === "portrait"
      ? [device.width, device.height]
      : [device.height, device.width];
  const canvasW = Math.max(1, Math.round(w * device.dpi));
  const canvasH = Math.max(1, Math.round(h * device.dpi));

  const bg =
    cfg.background && cfg.background !== "transparent"
      ? cfg.background
      : { r: 0, g: 0, b: 0, alpha: 0 };

  const buf = await sharp(src, { limitInputPixels: false })
    .resize({
      width: canvasW,
      height: canvasH,
      fit: "contain",
      background: bg,
      kernel: "lanczos3",
    })
    .resize({
      width: Math.round(canvasW * cfg.scale),
      height: Math.round(canvasH * cfg.scale),
      fit: "inside",
      withoutEnlargement: false,
    })
    .extend({
      top: Math.floor((canvasH - Math.round(canvasH * cfg.scale)) / 2),
      bottom: Math.ceil((canvasH - Math.round(canvasH * cfg.scale)) / 2),
      left: Math.floor((canvasW - Math.round(canvasW * cfg.scale)) / 2),
      right: Math.ceil((canvasW - Math.round(canvasW * cfg.scale)) / 2),
      background: bg,
    })
    .png({
      compressionLevel: 6,
      quality: 75,
      palette: true,
      adaptiveFiltering: true,
    })
    .toBuffer();

  const seed = [
    String(cfg.input),
    String(cfg.background ?? "transparent"),
    canvasW,
    canvasH,
    device.dpi,
    orientation,
    cfg.scale,
  ].join(":");

  const base =
    cfg.prefix || basename(cfg.input, extname(cfg.input)) || "splash";
  let filename = `${base}-${hashHex(seed, cfg.hashLength)}`;
  if (cfg.includeOrientation) filename += `-${orientation}`;
  filename += ".png";

  const outAbs = resolve(cfg.cwd, cfg.outdir);
  if (!existsSync(outAbs)) mkdirSync(outAbs, { recursive: true });

  const filePath = join(outAbs, filename);
  await sharp(buf).toFile(filePath);

  let url = relative(cfg.cwd, filePath);
  if (cfg.public) {
    const parts = url.split(sep);
    if (parts[0] === "public") url = parts.slice(1).join(sep);
  }
  return toPosix(url);
};
