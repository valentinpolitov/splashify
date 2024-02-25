import { join } from "node:path";
import fs from "fs-extra";
import type { PackageJson } from "type-fest";

export function getPackageInfo(): PackageJson {
  const packageJsonPath = join(process.cwd(), "package.json");

  return fs.readJSONSync(packageJsonPath) as PackageJson;
}
