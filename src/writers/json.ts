import { buildWriter } from "@/util/build-writer";
import { resultsToJson } from "@/writers/shared";

const writeJson = buildWriter(".json", resultsToJson);

export { writeJson };
