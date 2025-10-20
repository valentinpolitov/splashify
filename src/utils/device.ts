export type Device = Record<"width" | "height" | "dpi", number>;
export type DeviceString = `${number}x${number}@${number}`;

export function getDevice(value: string): Device {
  const match = value.match(/^(\d+)x(\d+)@(\d+)$/);

  if (!match) {
    throw new Error("Invalid device format. Expected {width}x{height}@{dpi}");
  }

  const [, width, height, dpi] = match.map(Number);

  return { width, height, dpi };
}

export function getDeviceString(device: Device): DeviceString {
  const { width, height, dpi } = device;

  return `${width}x${height}@${dpi}`;
}

export function getMediaString(
  device: Device,
  orientation?: "portrait" | "landscape" | null | undefined,
): string {
  const out = `screen and (device-width: ${device.width}px) and (device-height: ${device.height}px) and (-webkit-device-pixel-ratio: ${device.dpi})`;
  if (!orientation) return out;
  return `${out} and (orientation: ${orientation})`;
}
