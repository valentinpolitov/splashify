#!/usr/bin/env node
import { Command } from "commander";

import { gen } from "@/commands/gen";
import { getPackageInfo } from "@/utils/get-package-info";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main(): Promise<void> {
  const pkg = getPackageInfo();

  const program = new Command()
    .command("splashify")
    .description("Generate launch screens for your app")
    .version(
      pkg.version || "1.0.0",
      "-v, --version",
      "display package version",
    );

  program.addCommand(gen);

  program.parse();
}

main();
