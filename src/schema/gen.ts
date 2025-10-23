import { extname } from "node:path";
import { z } from "zod";

import { presetIOS } from "@/devices/preset-ios";
import { deviceStringSchema } from "@/schema/device";
import {
  _INTERNAL_UNSAFE_IN_RUNTIME_toDevice,
  deviceToString,
  stringToDevice,
} from "@/util/devices";

const allowedExtensionEnum = z.enum([
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".tiff",
  ".gif",
]);
type AllowedExtension = z.infer<typeof allowedExtensionEnum>;

const isAllowedExtension = (ext: unknown): ext is AllowedExtension =>
  z.string().toLowerCase().pipe(allowedExtensionEnum).safeParse(ext).success;

const imagePathSchema = z
  .string()
  .refine(
    (value) => isAllowedExtension(extname(value)),
    "The image must be an SVG, PNG, JPG, JPEG, WebP, AVIF, TIFF or GIF file.",
  );

const genOptionsSchema = z
  .object({
    devices: z
      .array(deviceStringSchema.transform(_INTERNAL_UNSAFE_IN_RUNTIME_toDevice))
      .nonempty(),
    portraitOnly: z.boolean(),
    landscapeOnly: z.boolean(),
    includeDefaults: z.boolean(),
    clean: z.boolean(),
    keep: z.boolean(),
    cwd: z.string(),
    input: imagePathSchema,
    background: z.string().optional(),
    scale: z.coerce.number().positive(),
    outdir: z.string(),
    hashLength: z.coerce.number().int().min(4).default(8),
    prefix: z.string().optional(),
    includeOrientation: z.boolean(),
    def: z.boolean(),
    defFile: z.string(),
    defOutdir: z.string(),
    public: z.boolean(),
    html: z.boolean(),
    json: z.boolean(),
    ts: z.boolean(),
    js: z.boolean(),
    cjs: z.boolean(),
    esm: z.boolean(),
  })
  .transform(({ devices: input, ...options }) => {
    const uniqueScreens = new Set(input.map(deviceToString));
    if (options.includeDefaults) {
      presetIOS.forEach((device) => uniqueScreens.add(deviceToString(device)));
    }
    const devices = Array.from(uniqueScreens).map(stringToDevice);
    return { ...options, devices };
  });

type GenOptions = z.infer<typeof genOptionsSchema>;

export type { AllowedExtension, GenOptions };
export { genOptionsSchema };
