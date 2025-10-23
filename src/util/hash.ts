import { createHash } from "node:crypto";

function hashHex(seed: string, hexLength: number): string {
  const bytes = Math.max(1, Math.ceil(hexLength / 2));
  return createHash("shake256", { outputLength: bytes })
    .update(seed)
    .digest("hex")
    .slice(0, hexLength);
}

export { hashHex };
