import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { createCanvas, loadImage } from "canvas";

import type { Renderer } from "@/core/types";
import { hashHex } from "@/util/hash";
import { toPosix } from "@/util/paths";

export const canvasRenderer: Renderer = async ({ src, job, cfg }) => {
  const { device, orientation } = job;
  const [w, h] =
    orientation === "portrait"
      ? [device.width, device.height]
      : [device.height, device.width];
  const canvasW = Math.max(1, Math.round(w * device.dpi));
  const canvasH = Math.max(1, Math.round(h * device.dpi));

  // Load the source image
  const image = await loadImage(src);

  // Create canvas
  const canvas = createCanvas(canvasW, canvasH);
  const ctx = canvas.getContext("2d");

  // Set background
  if (cfg.background && cfg.background !== "transparent") {
    ctx.fillStyle = cfg.background;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // Calculate image positioning (center and scale)
  const scale = cfg.scale;
  const scaledW = Math.round(canvasW * scale);
  const scaledH = Math.round(canvasH * scale);

  const x = Math.floor((canvasW - scaledW) / 2);
  const y = Math.floor((canvasH - scaledH) / 2);

  // Draw the image
  ctx.drawImage(image, x, y, scaledW, scaledH);

  // Generate filename
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
  const buffer = canvas.toBuffer("image/png");
  writeFileSync(filePath, buffer);

  let url = relative(cfg.cwd, filePath);
  if (cfg.public) {
    const parts = url.split(sep);
    if (parts[0] === "public") url = parts.slice(1).join(sep);
  }
  return toPosix(url);
};
