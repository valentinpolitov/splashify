import type { RenderResult, RunConfig } from "@/core/types";
import type { Device } from "@/schema/device";
import type { GenOptions } from "@/schema/gen";
import { getMediaString } from "@/util/devices";

export function mapOptionsToRunConfig(opts: GenOptions): RunConfig {
  return {
    cwd: opts.cwd,
    outdir: opts.outdir,
    defOutdir: opts.defOutdir,
    public: opts.public,
    scale: opts.scale,
    background: opts.background,
    hashLength: opts.hashLength,
    prefix: opts.prefix,
    includeOrientation: opts.includeOrientation,
    portraitOnly: opts.portraitOnly,
    landscapeOnly: opts.landscapeOnly,
    write: {
      html: opts.html,
      json: opts.json,
      esm: opts.js || opts.esm,
      cjs: opts.cjs,
      ts: opts.ts,
      def: opts.def,
      defFile: opts.defFile,
    },
    inputPathOrUrl: opts.input,
    devices: opts.devices,
    concurrency: 4,
  };
}

export function toResults(
  device: Device,
  urls: Partial<Record<"portrait" | "landscape", string>>,
): RenderResult[] {
  const results: RenderResult[] = [];

  if (urls.portrait) {
    results.push({
      url: urls.portrait,
      media: getMediaString(device, "portrait"),
    });
  }

  if (urls.landscape) {
    results.push({
      url: urls.landscape,
      media: getMediaString(device, "landscape"),
    });
  }

  return results;
}
