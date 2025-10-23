import { isAbsolute, resolve, sep } from "node:path";

const toPosix = (path: string): string => path.split(sep).join("/");

const resolveCwd = (cwd: string, path: string): string =>
  isAbsolute(path) ? path : resolve(cwd, path);

export { resolveCwd, toPosix };
