import { buildWriter } from "@/util/build-writer";
import { formatCode } from "@/util/format-code";
import { resultsToJs } from "@/writers/shared";

const writeJs = buildWriter(".js", (results) =>
  formatCode(resultsToJs(results), "babel"),
);

export { writeJs };
