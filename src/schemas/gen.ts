import path from "node:path";
import { z } from "zod";

import { iOSDevices } from "@/devices/ios";
import { getDevice, getDeviceString } from "@/utils/device";

const deviceSchema = z
  .string()
  .refine((value) => {
    const { width, height, dpi } = getDevice(value);

    const w = z.number().int().positive().safeParse(width);
    const h = z.number().int().positive().safeParse(height);
    const d = z.number().int().positive().safeParse(dpi);

    return w.success && h.success && d.success;
  })
  .transform(getDevice);

const extensionsSchema = z.enum([".svg", ".png", ".jpg", ".jpeg"]);
const imagePathSchema = z
  .string()
  .refine(
    (value) =>
      extensionsSchema.safeParse(path.extname(value.toLocaleLowerCase()))
        .success,
    "The image must be an SVG, PNG, JPG, or JPEG file.",
  );

export const genOptionsSchema = z
  .object({
    devices: z.array(deviceSchema),
    includeDefaults: z.boolean(),
    keepStale: z.boolean(),
    cwd: z.string(),
    input: imagePathSchema,
    bgColor: z.string().optional(),
    scale: z.string().pipe(z.coerce.number().positive()),
    outdir: z.string(),
    hashLength: z.string().pipe(z.coerce.number().int().min(4)),
    html: z.boolean(),
    json: z.boolean(),
    ts: z.boolean(),
    cjs: z.boolean(),
    esm: z.boolean(),
  })
  .transform((options) => {
    const inputDevices = [...options.devices];

    if (options.includeDefaults) {
      inputDevices.push(...iOSDevices);
    }

    const uniqueDevices = Array.from(
      new Set(inputDevices.map(getDeviceString)),
    );

    const devices = uniqueDevices.map(getDevice);

    return { ...options, devices };
  });

export type GenOptions = z.infer<typeof genOptionsSchema>;
