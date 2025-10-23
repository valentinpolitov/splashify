import { pLimit } from "@/core/pool";
import type { Renderer, RenderResult, RunConfig } from "@/core/types";
import { loadSource } from "@/services/loader";
import { getMediaString } from "@/util/devices";

async function runPipeline(
  cfg: RunConfig,
  renderer: Renderer,
): Promise<RenderResult[]> {
  const src = await loadSource(cfg.inputPathOrUrl, cfg.cwd);

  const limit = pLimit(Math.max(1, cfg.concurrency));

  const jobs = cfg.devices.flatMap((d) => {
    const square = d.width === d.height;
    if (square) return [{ device: d, orientation: "portrait" as const }];
    const out: { device: typeof d; orientation: "portrait" | "landscape" }[] =
      [];
    if (!cfg.landscapeOnly) out.push({ device: d, orientation: "portrait" });
    if (!cfg.portraitOnly) out.push({ device: d, orientation: "landscape" });
    return out;
  });

  const urls = await Promise.all(
    jobs.map((job) =>
      limit(() =>
        renderer({
          src,
          job,
          cfg: {
            cwd: cfg.cwd,
            outdir: cfg.outdir,
            public: cfg.public,
            background: cfg.background,
            scale: cfg.scale,
            hashLength: cfg.hashLength,
            prefix: cfg.prefix,
            includeOrientation: cfg.includeOrientation,
            input: cfg.inputPathOrUrl,
          },
        }),
      ).then((url) => ({ job, url })),
    ),
  );

  const results: RenderResult[] = [];
  for (const d of cfg.devices) {
    const square = d.width === d.height;
    if (square) {
      const u = urls.find(
        (x) => x.job.device === d && x.job.orientation === "portrait",
      )?.url;
      if (!u) continue;
      results.push({ url: u, media: getMediaString(d, "portrait") });
      results.push({ url: u, media: getMediaString(d, "landscape") });
      continue;
    }
    const p = urls.find(
      (x) => x.job.device === d && x.job.orientation === "portrait",
    )?.url;
    const l = urls.find(
      (x) => x.job.device === d && x.job.orientation === "landscape",
    )?.url;
    if (p) results.push({ url: p, media: getMediaString(d, "portrait") });
    if (l) results.push({ url: l, media: getMediaString(d, "landscape") });
  }

  return results;
}

export { runPipeline };
