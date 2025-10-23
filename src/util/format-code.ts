import pluginBabel from "prettier/plugins/babel";
import pluginEstree from "prettier/plugins/estree";
import pluginHTML from "prettier/plugins/html";
import pluginTS from "prettier/plugins/typescript";
import prettier from "prettier/standalone";

type Parser = "babel" | "typescript" | "html";

const PLUGIN_PRESETS: Record<
  Parser,
  (string | URL | import("prettier").Plugin)[]
> = {
  babel: [pluginBabel, pluginEstree],
  typescript: [pluginTS, pluginEstree],
  html: [pluginHTML, pluginEstree],
};

const formatCode = async (code: string, parser: Parser): Promise<string> =>
  prettier.format(code, { parser, plugins: PLUGIN_PRESETS[parser] });

export { formatCode };
