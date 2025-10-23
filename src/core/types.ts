import type { Device } from "@/schema/device";

export type Orientation = "portrait" | "landscape";

export type RenderJob = {
  device: Device;
  orientation: Orientation;
};

export type RenderResult = {
  url: string;
  media: string; // precomputed; writers just dump
};

export type Renderer = (params: {
  src: Buffer;
  job: RenderJob;
  cfg: {
    cwd: string;
    outdir: string;
    public: boolean;
    background?: string;
    scale: number;
    hashLength: number;
    prefix?: string;
    includeOrientation: boolean;
    input: string;
  };
}) => Promise<string>; // returns URL

export type Writer = (params: {
  results: RenderResult[];
  defFile: string;
  outdirAbs: string;
}) => Promise<void> | void;

export type RunConfig = {
  cwd: string;
  outdir: string;
  defOutdir: string;
  public: boolean;

  // render
  scale: number;
  background?: string;
  hashLength: number;
  prefix?: string;
  includeOrientation: boolean;

  // behavior
  portraitOnly: boolean;
  landscapeOnly: boolean;

  // defs
  write: {
    html?: boolean;
    json?: boolean;
    esm?: boolean;
    cjs?: boolean;
    ts?: boolean;
    def: boolean; // master toggle
    defFile: string;
  };

  // input
  inputPathOrUrl: string;

  // devices
  devices: Device[];

  // pool
  concurrency: number; // default 4
};
