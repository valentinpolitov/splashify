import chalk from "chalk";

export const logger = {
  error(...args: unknown[]): void {
    console.log(chalk.red(...args));
  },
  warn(...args: unknown[]): void {
    console.log(chalk.yellow(...args));
  },
  info(...args: unknown[]): void {
    console.log(chalk.cyan(...args));
  },
  success(...args: unknown[]): void {
    console.log(chalk.green(...args));
  },
  break(): void {
    console.log("");
  },
};
