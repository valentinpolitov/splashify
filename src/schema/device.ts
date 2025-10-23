import { z } from "zod";

const deviceStringSchema = z.templateLiteral([
  z.int().positive(),
  z.literal("x"),
  z.int().positive(),
  z.literal("@"),
  z.int().positive(),
]);

const deviceSchema = z.object({
  width: z.coerce.number().int().positive(),
  height: z.coerce.number().int().positive(),
  dpi: z.coerce.number().int().positive(),
});

type DeviceString = z.infer<typeof deviceStringSchema>;
type Device = z.infer<typeof deviceSchema>;

export type { Device, DeviceString };
export { deviceSchema, deviceStringSchema };
