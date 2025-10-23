import type { RenderResult } from "@/core/types";

/**
 * Converts a RenderResult to an HTML link tag for Apple touch startup images
 */
const resultToHtmlLink = ({ url, media }: RenderResult): string =>
  `<link rel="apple-touch-startup-image" href="${url}" media="${media}">`;

/**
 * Converts RenderResult array to HTML string
 */
const resultsToHtml = (results: RenderResult[]): string =>
  results.map(resultToHtmlLink).join("\n");

/**
 * Converts RenderResult array to JSON string
 */
const resultsToJson = (results: RenderResult[]): string =>
  JSON.stringify(results, null, 2);

/**
 * Converts RenderResult array to TypeScript export
 */
const resultsToTs = (results: RenderResult[]): string =>
  `type Resource = {url:string;media:string};\n\nconst resources: Resource[] = ${JSON.stringify(results)}\n\nexport type { Resource };\nexport { resources }`;

/**
 * Converts RenderResult array to ESM export
 */
const resultsToJs = (results: RenderResult[]): string =>
  `/** @type {{url:string;media:string}[]} */\nconst resources = ${JSON.stringify(results)}\n\nexport { resources }`;

/**
 * Converts RenderResult array to CommonJS export
 */
const resultsToCjs = (results: RenderResult[]): string =>
  `/** @type {{url:string;media:string}[]} */\nconst resources = ${JSON.stringify(results)}\n\nmodule.exports = { resources }`;

export {
  resultsToCjs,
  resultsToHtml,
  resultsToJs,
  resultsToJson,
  resultsToTs,
  resultToHtmlLink,
};
