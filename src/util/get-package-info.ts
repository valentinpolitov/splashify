import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PackageJson } from "type-fest";

import { logger } from "@/util/logger";

function getPackageInfo(): PackageJson {
  const packageJsonPath = join(process.cwd(), "package.json");
  if (!existsSync(packageJsonPath)) {
    logger.warn(`Could not locate \`package.json\` at ${process.cwd()}`);
    return {};
  }
  return JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJson;
}

export { getPackageInfo };
