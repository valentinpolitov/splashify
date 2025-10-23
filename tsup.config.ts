import { defineConfig } from "tsup";

export default defineConfig({
  clean: false,
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: true,
  target: "esnext",
  outDir: "dist",
  banner: {
    js: "#!/usr/bin/env node --harmony",
  },
});
