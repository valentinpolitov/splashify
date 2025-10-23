import chalk from "chalk";

function error(...args: unknown[]): void {
  console.log(chalk.red(...args));
}
function warn(...args: unknown[]): void {
  console.log(chalk.yellow(...args));
}
function info(...args: unknown[]): void {
  console.log(chalk.cyan(...args));
}
function success(...args: unknown[]): void {
  console.log(chalk.green(...args));
}
function br(): void {
  console.log("");
}
const logger = {
  error,
  warn,
  info,
  success,
  break: br,
  br,
};

export { br, error, info, logger, success, warn };
