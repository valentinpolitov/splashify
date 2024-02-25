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
  orientation: "portrait" | "landscape",
): string {
  const { width, height, dpi } = device;

  return `screen and (device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${dpi}) and (orientation: ${orientation})`;
}
