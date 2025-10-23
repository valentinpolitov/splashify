import { buildWriter } from "@/util/build-writer";
import { formatCode } from "@/util/format-code";
import { resultsToTs } from "@/writers/shared";

const writeTs = buildWriter(".ts", (results) =>
  formatCode(resultsToTs(results), "typescript"),
);

export { writeTs };
