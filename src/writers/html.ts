import { buildWriter } from "@/util/build-writer";
import { formatCode } from "@/util/format-code";
import { resultsToHtml } from "@/writers/shared";

const writeHtml = buildWriter(".html", (results) =>
  formatCode(resultsToHtml(results), "html"),
);

export { writeHtml };
