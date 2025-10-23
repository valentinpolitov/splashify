import { buildWriter } from "@/util/build-writer";
import { formatCode } from "@/util/format-code";
import { resultsToCjs } from "@/writers/shared";

const writeCjs = buildWriter(".cjs", (results) =>
  formatCode(resultsToCjs(results), "babel"),
);

export { writeCjs };
