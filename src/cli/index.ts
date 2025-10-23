import { Command } from "commander";

import { generate } from "@/commands/generate";
import { getPackageInfo } from "@/util/get-package-info";

import "@total-typescript/ts-reset";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main(): Promise<void> {
  const pkg = getPackageInfo();
  const program = new Command()
    .command("splashify")
    .description("Generate launch screens for your app")
    .version(pkg.version ?? "1.0.0", "-v, --version", "display package version")
    .addCommand(generate);

  await program.parseAsync();
}
main();
