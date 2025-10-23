import {
  type Device,
  deviceSchema,
  type DeviceString,
  deviceStringSchema,
} from "@/schema/device";

function isDevice(value: unknown): value is Device {
  return deviceSchema.safeParse(value).success;
}

function isDeviceString(value: unknown): value is DeviceString {
  return deviceStringSchema.safeParse(value).success;
}

function _checkDevice(value: unknown): asserts value is Device {
  if (!isDevice(value)) {
    throw new Error("Invalid device object");
  }
}

function _checkDeviceString(value: unknown): asserts value is DeviceString {
  if (!isDeviceString(value)) {
    throw new Error("Invalid device format. Expected {width}x{height}@{dpi}");
  }
}

function _toDevice(value: DeviceString): Device {
  const [width, rest] = value.split("x");
  const [height, dpi] = rest.split("@");
  return deviceSchema.parse({ width, height, dpi });
}

function deviceToString(device: Device): DeviceString {
  _checkDevice(device);
  return `${device.width}x${device.height}@${device.dpi}`;
}

function stringToDevice(value: string): Device {
  _checkDeviceString(value);
  return _toDevice(value);
}

function getMediaString(
  device: Device,
  orientation?: "portrait" | "landscape" | null | undefined,
): string {
  _checkDevice(device);
  const rules = [
    "screen",
    `(device-width: ${device.width}px)`,
    `(device-height: ${device.height}px)`,
    `(-webkit-device-pixel-ratio: ${device.dpi})`,
  ];
  if (orientation) rules.push(`(orientation: ${orientation})`);
  return rules.join(" and ");
}

export {
  _toDevice as _INTERNAL_UNSAFE_IN_RUNTIME_toDevice,
  deviceToString,
  getMediaString,
  isDevice,
  isDeviceString,
  stringToDevice,
};
